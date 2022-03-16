import React, { useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import isEmpty from 'lodash.isempty'
import isUndefined from 'lodash.isundefined'
import { useRequest } from 'ahooks'
import { useDispatch, useSelector } from 'react-redux'
import { LocalizationContext } from '../../../../translation/Translation'
import DocumentUploadService from '../../../../services/DocumentUploadService'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import ImageUploadComponent from '../common/ImageUploadComponent'
import DataService from '../../../../services/DataService'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'
const uploadedFileName = 'pancard.jpg'

const resourceFactoryConstants = new ResourceFactoryConstants()
const uploadFileToServer = async (dispatch, file) => {
  if (isEmpty(file)) {
    return
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await DataService.postData(
      resourceFactoryConstants.constants.pan.verfifyPanOcr,
      formData
    )
    const resData = res.data
    if (resData.status === 'SUCCESS') {
      await Promise.all([
        dispatch.formDetails.setPanData(resData),
        dispatch.formDetails.setPanFile(file),
        dispatch.formDetails.setIsPanVerified('Yes')
      ])

      const docResponse = await uploadToAppWrite(file)
      return docResponse
    } else {
      console.log(resData.message)
      throw new Error('CANNOT_VALIDATE_PAN')
    }
  } catch (e) {
    console.log(e)
    console.log(e.stack)
    if (e.message === 'CANNOT_VALIDATE_PAN') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_PAN_VALIDATION_SERVICE')
    }
  }
}

const uploadToAppWrite = async (file) => {
  const documentUploadService = new DocumentUploadService()
  try {
    const res = await documentUploadService.uploadFileToAppWrite([file])
    const responseData = res.data
    if (responseData.status === 'SUCCESS') {
      return {
        uploadedDocId: responseData.fileId,
        file
      }
    } else {
      console.log(responseData)
      throw new Error('UPLOAD_PAN_TO_DOC_SERVER_FAILED')
    }
  } catch (e) {
    console.log(e)
    if (e.message === 'UPLOAD_PAN_TO_DOC_SERVER_FAILED') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_DOCUMENT_UPLOAD_SERVICE')
    }
  }
}

const PanCardUploadWidget = (props) => {
  const [imageBase64Data, setImageBase64Data] = useState()
  const dispatch = useDispatch()
  const panFile = useSelector(state => state.formDetails.panFile)
  const hasError = isUndefined(props.rawErrors) ? 0 : props.rawErrors.length > 0
  const [isUploadDone, setIsUploadDone] = useState(!isEmpty(panFile))
  const useRemoveFile = useRequest(() => dispatch.formDetails.setPanFile(undefined), {
    manual: true
  })

  const useRenderImageFromDb = useRequest(async (value) => {
    const temp = value.split('::')
    const base64Data = await ReactJsonSchemaUtil.getBase64ImageData(`${resourceFactoryConstants.constants.lending.downloadFile}${temp[0]}`)
    return base64Data
  }, {
    manual: true,
    onSuccess: (base64Data) => {
      setImageBase64Data(base64Data)
      setIsUploadDone(true) // setting as data is already saved
    }
  })
  useEffect(async () => {
    if (!isEmpty(props.value)) {
      useRenderImageFromDb.run(props.value)
    }
  }, [props.value])
  const uploadFile = useRequest(uploadFileToServer, {
    manual: true,
    onSuccess: (results, params) => {
      const { uploadedDocId } = results
      props.onChange(uploadedDocId + '::' + uploadedFileName)
      setIsUploadDone(true)
      Toast.show({
        type: 'success',
        position: 'bottom',
        props: {
          title: translations['pan.title'],
          description: translations['pan.success']
        }
      })
    },
    onError: (error, params) => {
      console.log(error)
      setIsUploadDone(true)
      if (error.message === 'CANNOT_REACH_PAN_VALIDATION_SERVICE' || error.message === 'CANNOT_REACH_DOCUMENT_UPLOAD_SERVICE') {
        throw error
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['pan.title'],
            description: translations['pan.failed']
          }
        })
      }
    }
  })
  const { translations } = useContext(LocalizationContext)
  // let docId, fileName
  // if (props.value) {
  //   const tempArr = props.value.split('::')
  //   docId = tempArr[0]
  //   fileName = tempArr[1]
  // }
  const removeFile = (uri) => {
    if (uri.length > 0) {
      useRemoveFile.run()
      // remove from props
      props.onChange(undefined)
      setIsUploadDone(false)
      setImageBase64Data(undefined)
    }
  }
  const onFileChange = async (data) => {
    setIsUploadDone(false)
    const fileDetails = {
      uri: data.uri,
      type: data.type,
      name: 'panCard.jpg'
    }
    uploadFile.run(dispatch, fileDetails)
    // do automatic upload to the server
  }
  return (
    <>
      {/* {props.value && (
        <>
          <Text category='s1' status='success'>
            {translations['Upload.successfully']}
          </Text>
          <DownloadComponent fileUrl={fileName} uploadedDocId={docId} />
        </>
      )} */}
      <ImageUploadComponent
        hasError={hasError}
        isUploadDone={isUploadDone}
        onFileChange={onFileChange}
        uris={panFile ? [panFile.uri] : (imageBase64Data ? [imageBase64Data] : [])}
        loading={uploadFile.loading || useRenderImageFromDb.loading}
        selectText={translations['pan.uploadText']}
        removeFile={removeFile}
      />
    </>
  )
}
export default PanCardUploadWidget
