import React, { useContext, useState } from 'react'
import { useRequest } from 'ahooks'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { Card, Modal, Spinner, StyleService, Text } from '@ui-kitten/components'
import { Dimensions } from 'react-native'
import isEmpty from 'lodash.isempty'
import Toast from 'react-native-toast-message'
import { LocalizationContext } from '../../../../translation/Translation'
import DocumentUploadService from '../../../../services/DocumentUploadService'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import DocumentPicker from 'react-native-document-picker'
import DataService from '../../../../services/DataService'
import DocumentUploadComponent from '../common/DocumentUploadComponent'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'
import apiService from '../../../../../../../apiService'
import { WebView } from 'react-native-webview'
import appConstants from '../../../../constants/appConstants'
import { config } from '../../../../../../../config'

const getNewFileAdded = (newFiles, oldFiles = []) => {
  if (newFiles.length === 0) {
    return []
  }
  if (oldFiles.length === 0) {
    return newFiles
  }
  const addedFiles = []
  newFiles.forEach(file => {
    if (!oldFiles.some((of) => of.name === file.name)) {
      addedFiles.push(file)
    }
  })
  return addedFiles
}

const uploadBankStatement = async (dispatch, files, currentLoanApplicationId, panData, uploadedFileIdsWithName) => {
  // Code to upload bank Statement
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const url = resourceFactoryConstants.constants.bankStatement.uploadBankStatement
  const formData = new FormData()
  for (const file of files) {
    formData.append('file', file)
  }
  formData.append('currentLoanApplicationId', currentLoanApplicationId)
  try {
    const res = await DataService.postData(url, formData)
    const responseData = res.data
    const uploadedDocIds = []
    if (responseData.status === 'SUCCESS') {
      const bankStatementData = { statement: responseData?.data?.statement, transaction_details: { accounts: responseData?.data?.transaction_details?.accounts } }
      // Validate BankStatement Data with PanData
      const isBankStatementValidationPass = await validateBankStatement(panData, bankStatementData)
      if (!isBankStatementValidationPass) {
        throw new Error('BANK_STATEMENT_VALIDATION_FAILED')
      }
      for (let r = 0; r < files.length; r++) {
        const docDetails = await uploadToAppWrite(files[r])
        uploadedDocIds.push(`${docDetails.uploadedDocId}::${docDetails.uploadedFileName}`)
      }
      await dispatch.formDetails.setIsBankStatementVerified('Yes')
      files.forEach(file => {
        file.uploading = false
      })
      await dispatch.formDetails.setBankStatementFiles(uploadedFileIdsWithName ? [...uploadedFileIdsWithName, ...files] : files)
      await dispatch.formDetails.setBankStatementData(bankStatementData)
      return { uploadedDocIds }
    } else {
      throw new Error('INVALID_BANK_STATEMENT')
    }
  } catch (e) {
    console.log(e)
    if (e.message === 'INVALID_BANK_STATEMENT' || e.message === 'BANK_STATEMENT_VALIDATION_FAILED') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_STATEMENT_VALIDATION_SERVICE')
    }
  }
}
const uploadToAppWrite = async (file) => {
  const documentUploadService = new DocumentUploadService()
  if (isEmpty(file)) {
    return
  }
  try {
    const res = await documentUploadService.uploadFileToAppWrite(file)
    const responseData = res.data
    if (responseData.status === 'SUCCESS') {
      return {
        uploadedDocId: responseData.fileId,
        uploadedFileName: file.name
      }
    } else {
      console.log(responseData)
      throw new Error('UPLOAD_STATEMENT_TO_DOC_SERVER_FAILED')
    }
  } catch (err) {
    console.log(err)
    if (err.message === 'UPLOAD_STATEMENT_TO_DOC_SERVER_FAILED') {
      throw err
    } else {
      throw new Error('CANNOT_REACH_STATEMENT_UPLOAD_SERVER')
    }
  }
}

const validateBankStatement = async (panData, bankStatementData) => {
  try {
    let validationResult
    if (config.APPWRITE_FUNCTION_CALL) {
      const executionId = await apiService.appApi.bankStatement.validation.execute({ panData, bankStatementData })
      validationResult = await apiService.appApi.bankStatement.validation.get(executionId)
    } else {
      const endpoints = new ResourceFactoryConstants()
      const res = await DataService.postData(endpoints.constants.appwriteAlternative.validateBankStatement, { panData, bankStatementData })
      validationResult = res.data
    }
    if (validationResult.status === 'success') {
      return true
    } else {
      return false
    }
  } catch (error) {
    throw new Error('CANNOT_REACH_BANK_VALIDATION_SERVER')
  }
}

const netBankingHandle = async () => {
  try {
    const resourceFactoryConstants = new ResourceFactoryConstants()
    const res = await DataService.postData(resourceFactoryConstants.constants.finbox.getSessionAPI, {
      link_id: ReactJsonSchemaUtil.getRandomUUID(),
      api_key: appConstants.finboxApiKey
    })
    if (res.status === 200) {
      return res.data.redirect_url
    } else {
      throw new Error('FINBOX_CONNECTION_FAILED')
    }
  } catch (err) {
    if (err.message === 'FINBOX_CONNECTION_FAILED') {
      throw err
    } else {
      throw new Error('UNABLE_TO_CONNECT_FINBOX')
    }
  }
}

const BankStatementUploadField = (props) => {
  let uploadedFileIdsWithName
  const [reset, setResetToFalse] = useState(false)
  const dispatch = useDispatch()
  const store = useStore()
  const state = useSelector(state => state)
  const [show, setShow] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState()
  // need a copy of bank statement files and not direct reference to state
  const currentLoanApplicationId = state.loanApplications.currentLoanApplicationId
  const bankStatementFiles = store.select.formDetails.getBankStatementFiles(state)
  const bankStaementFilesCopy = JSON.parse(JSON.stringify(bankStatementFiles))
  const [isUploadDone, setIsUploadDone] = useState(false)
  const { translations } = useContext(LocalizationContext)
  const panData = state?.formDetails?.panData
  const useRemoveFile = useRequest((file) => dispatch.formDetails.removeFromBankStatementFiles(file), {
    manual: true
  })

  if (!isEmpty(props?.formData)) {
    uploadedFileIdsWithName = ReactJsonSchemaUtil.getUploadedFileIdsWithNameArray(props.formData)
  }
  const uploadFiles = useRequest(uploadBankStatement, {
    manual: true,
    onSuccess: (result, params) => {
      const { uploadedDocIds } = result
      const allUploadedDocIds = props.formData ? [...props.formData, ...uploadedDocIds] : uploadedDocIds
      props.onChange(allUploadedDocIds)
      setIsUploadDone(true)
      Toast.show({
        type: 'success',
        position: 'bottom',
        visibilityTime: 2000,
        props: {
          title: translations['statement.title'],
          description: translations['statement.success']
        }
      })
    },
    onError: (error, params) => {
      if (error.message === 'CANNOT_REACH_STATEMENT_VALIDATION_SERVICE' ||
        error.message === 'CANNOT_REACH_STATEMENT_UPLOAD_SERVER'
      ) {
        setResetToFalse(true)
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['statement.title'],
            description: translations['something.went.wrong']
          }
        })
      } else if (error.message === 'BANK_STATEMENT_VALIDATION_FAILED') {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['statement.title'],
            description: translations['statement.bankstatement.failed']
          }
        })
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['statement.title'],
            description: translations['statement.failed']
          }
        })
      }
    }
  })
  const removeFile = (file) => {
    if (!isEmpty(file) > 0) {
      useRemoveFile.run(file)
      // remove from props
      const newProps = props.formData.filter(v => v.indexOf(file.name) === -1)
      props.onChange(isEmpty(newProps) ? undefined : [...newProps])
    }
  }
  const onFileChange = (allFiles) => {
    setIsUploadDone(false)
    setResetToFalse(false)
    const newFilesAdded = getNewFileAdded(allFiles, uploadedFileIdsWithName)
    if (newFilesAdded.length > 0) {
      uploadFiles.run(dispatch, newFilesAdded, currentLoanApplicationId, panData, uploadedFileIdsWithName)
    }
  }
  const finboxEventHandler = (event) => {
    const data = JSON.parse(event.nativeEvent.data)
    if (data?.entityId) {
      props.onChange(data.entityId)
      setTimeout(() => {
        setShow(false)
      }, 5000)
    } else if (data?.reason && data?.error_type) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        props: {
          title: translations['statement.title'],
          description: data.reason
        }
      })
    } else if (data?.message) {
      setShow(false)
    }
  }
  const useNetBankingHandler = useRequest(netBankingHandle, {
    manual: true,
    onSuccess: (redirectUrl) => {
      setRedirectUrl(redirectUrl)
      setShow(true)
    },
    onError: () => {
      Toast.show({
        type: 'error',
        position: 'bottom',
        props: {
          title: translations['statement.title'],
          description: translations['esign.unexpected.error']
        }
      })
    }
  })
  const openNetBankingModalHandler = () => {
    useNetBankingHandler.run()
  }
  return (
    <>
      <Text appearance='hint' category='label'>
        {props.schema.title}
      </Text>
      <DocumentUploadComponent
        isUploadDone={isUploadDone}
        onFileChange={onFileChange}
        multiple
        files={!isEmpty(bankStaementFilesCopy) ? bankStaementFilesCopy : uploadedFileIdsWithName}
        type={[DocumentPicker.types.pdf]}
        loading={uploadFiles.loading}
        selectText={translations['statement.uploadText']}
        removeFile={removeFile}
        isAddMore={false}
        reset={reset}
      />
      {/* Will Uncomment, once statement Data Api is ready */}
      {/* <TouchableOpacity
        onPress={openNetBankingModalHandler}
        style={{ marginVertical: 3 }}
      >
        <Text category='label' status='primary'>
          {translations['statement.upload.netbanking']}
        </Text>
      </TouchableOpacity> */}
      <Text appearance='hint' category='label' status='info'>
        {props.schema.description}
      </Text>
      {/* Model */}
      <Modal visible={show} backdropStyle={styles.backdrop}>
        <Card style={styles.card}>
          {useNetBankingHandler.loading && <Spinner />}
          <WebView
            source={{ uri: redirectUrl }}
            height={Dimensions.get('window').height - 200}
            width={Dimensions.get('window').width - 70}
            onMessage={finboxEventHandler}
            nestedScrollEnabled
          />
        </Card>
      </Modal>
    </>
  )
}
const styles = StyleService.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  card: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
export default BankStatementUploadField
