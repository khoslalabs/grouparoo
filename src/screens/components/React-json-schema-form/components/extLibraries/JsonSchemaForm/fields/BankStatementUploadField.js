import React, { useContext, useState } from 'react'
import { useRequest } from 'ahooks'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { Text } from '@ui-kitten/components'
import isEmpty from 'lodash.isempty'
import Toast from 'react-native-toast-message'
import { LocalizationContext } from '../../../../translation/Translation'
import DocumentUploadService from '../../../../services/DocumentUploadService'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import DocumentPicker from 'react-native-document-picker'
import DataService from '../../../../services/DataService'
import DocumentUploadComponent from '../common/DocumentUploadComponent'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'

const getNewFileAdded = (newFiles, oldFiles = []) => {
  if (newFiles.length === 0) {
    return []
  }
  if (oldFiles.length === 0) {
    return newFiles
  }
  const addedFiles = []
  newFiles.forEach(file => {
    if (!oldFiles.some((of) => of.uri === file.uri)) {
      addedFiles.push(file)
    }
  })
  return addedFiles
}

const uploadBankStatement = async (dispatch, files) => {
  // Code to upload bank Statement
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const url = resourceFactoryConstants.constants.bankStatement.uploadBankStatement
  const formData = new FormData()
  for (const file of files) {
    formData.append('file', file)
  }
  try {
    const res = await DataService.postData(url, formData)
    const responseData = res.data
    const uploadedDocIds = []
    if (responseData.status === 'SUCCESS') {
      for (let r = 0; r < files.length; r++) {
        const docDetails = await uploadToAppWrite(files[r])
        uploadedDocIds.push(`${docDetails.uploadedDocId}'::'${docDetails.uploadedFileName}`)
      }
      await dispatch.formDetails.setIsBankStatementVerified('Yes')
      files.forEach(file => {
        file.uploading = false
      })
      await dispatch.formDetails.setBankStatementFiles(files)
      return { uploadedDocIds }
    } else {
      throw new Error('INVALID_BANK_STATEMENT')
    }
  } catch (e) {
    console.log(e)
    if (e.message === 'INVALID_BANK_STATEMENT') {
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
const BankStatementUploadField = (props) => {
  let uploadedFileIdsWithName
  const dispatch = useDispatch()
  const store = useStore()
  const state = useSelector(state => state)
  // need a copy of bank statement files and not direct reference to state
  const bankStatementFiles = store.select.formDetails.getBankStatementFiles(state)
  const bankStaementFilesCopy = JSON.parse(JSON.stringify(bankStatementFiles))
  const [isUploadDone, setIsUploadDone] = useState(false)
  const { translations } = useContext(LocalizationContext)
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
      const allUploadedDocIds = props.formData ? [...props.value, ...uploadedDocIds] : uploadedDocIds
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
      console.log(error)
      setIsUploadDone(true)
      if (error.message === 'CANNOT_REACH_STATEMENT_VALIDATION_SERVICE' ||
        error.message === 'CANNOT_REACH_STATEMENT_UPLOAD_SERVER'
      ) {
        throw error
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
      const newProps = props.formData.filter(v => v.indexOf(file.name) > -1)
      props.onChange([...newProps])
    }
  }
  const onFileChange = (allFiles) => {
    setIsUploadDone(false)
    const newFilesAdded = getNewFileAdded(allFiles, bankStatementFiles)
    if (newFilesAdded.length > 0) {
      uploadFiles.run(dispatch, newFilesAdded)
    }
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
      />
      <Text appearance='hint' category='label' status='info'>
        {props.schema.description}
      </Text>
    </>
  )
}
export default BankStatementUploadField
