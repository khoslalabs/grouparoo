import { StyleService } from '@ui-kitten/components'
import React, { useContext, useEffect, useState } from 'react'
import { useRequest } from 'ahooks'
import Toast from 'react-native-toast-message'
import isUndefined from 'lodash.isundefined'
import isEmpty from 'lodash.isempty'
import { useDispatch, useSelector } from 'react-redux'
import { LocalizationContext } from '../../../../translation/Translation'
import DocumentUploadService from '../../../../services/DocumentUploadService'
import ImageUploadComponent from '../common/ImageUploadComponent'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import DataService from '../../../../services/DataService'

const resourceFactoryConstants = new ResourceFactoryConstants()

const uploadFileForFaceMatch = async (dispatch, file, docface) => {
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const url = resourceFactoryConstants.constants.kyc.getUrlForFaceMatch
  const formData = new FormData()
  formData.append('file', file)
  formData.append('doc_face', docface)
  try {
    const res = await DataService.postData(url, formData)
    if (res.data.status === 'SUCCESS') {
      await dispatch.formDetails.setOkycSelfieFile(file)
      const { uploadedDocId, uploadedFileName } = await uploadToAppWrite([file])
      return { uploadedDocId, uploadedFileName }
    } else {
      console.log(res.data.message)
      throw new Error('FACE_MATCH_FAILED')
    }
  } catch (e) {
    if (e.message === 'FACE_MATCH_FAILED') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_FACE_MATCH_SERVER')
    }
  }
}

const uploadToAppWrite = async (file) => {
  const documentUploadService = new DocumentUploadService()
  if (isEmpty(file)) {
    return
  }
  const uploadedFileName = ReactJsonSchemaUtil.getFileName(file).join('::')
  try {
    const res = await documentUploadService.uploadFileToAppWrite(file)
    const responseData = res.data
    if (responseData.status === 'SUCCESS') {
      return {
        uploadedDocId: responseData.fileId,
        uploadedFileName
      }
    } else {
      console.log(responseData)
      throw new Error('UPLOAD_SELFIE_TO_DOC_SERVER_FAILED')
    }
  } catch (err) {
    console.log(err)
    if (err.message === 'UPLOAD_SELFIE_TO_DOC_SERVER_FAILED') {
      throw err
    } else {
      throw new Error('CANNOT_REACH_SELFIE_UPLOAD_SERVER')
    }
  }
}

const SelfieWidget = (props) => {
  const hasError = isUndefined(props.rawErrors)
    ? 0
    : props.rawErrors.length > 0
  const kycData = useSelector((state) => {
    const data = state.formDetails.kycData
    return data
  })
  const selfieFile = useSelector((state) => state.formDetails.okycSelfieFile)
  const [isUploadDone, setIsUploadDone] = useState(!isEmpty(selfieFile))
  const [imageBase64Data, setImageBase64Data] = useState()
  const { translations } = useContext(LocalizationContext)
  const dispatch = useDispatch()
  const useRemoveFile = useRequest(() => dispatch.formDetails.setOkycSelfieFile(undefined), {
    manual: true
  })
  useEffect(async () => {
    if (!isEmpty(props.value)) {
      useRenderImageFromDb.run(props.value)
    }
  }, [props.value])
  const removeFile = (uri) => {
    if (uri.length > 0) {
      useRemoveFile.run()
      // remove from props
      props.onChange(undefined)
      setIsUploadDone(false)
      setImageBase64Data(false)
    }
  }
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
  const useFaceMatch = useRequest(uploadFileForFaceMatch, {
    manual: true,
    onSuccess: (res) => {
      setIsUploadDone(true)
      props.onChange(res.uploadedDocId + '::' + res.uploadedFileName)
      Toast.show({
        type: 'success',
        position: 'bottom',
        props: {
          title: translations['okyc.facematch.title'],
          description: translations['okyc.facematch.success']
        }
      })
    },
    onError: (error) => {
      console.log(error)
      setIsUploadDone(true)
      if (error.message === 'FACE_MATCH_FAILED') {
        throw error
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['okyc.facematch.title'],
            description: translations['okyc.facematch.failed']
          }
        })
      }
    }
  })
  const onFileChange = (data) => {
    setIsUploadDone(false)
    const fileDetails = {
      uri: data.uri,
      type: data.type,
      name: 'selfie.jpg'
    }
    const docface = kycData?.photo_link
    if (!isUndefined(docface) || !isEmpty(docface)) {
      useFaceMatch.run(dispatch, fileDetails, docface)
    } else {
      Toast.show({
        type: 'error',
        position: 'bottom',
        props: {
          title: translations['selfie.title'],
          description: translations['selfie.compleKycFirst.message']
        }
      })
    }
  }
  return (
    <>

      <ImageUploadComponent
        isUploadDone={isUploadDone}
        onFileChange={onFileChange}
        useFrontCamera={false}
        uris={selfieFile ? [selfieFile.uri] : (imageBase64Data ? [imageBase64Data] : [])}
        hasError={hasError}
        selectText={translations['selfie.uploadText']}
        loading={useFaceMatch.loading || useRenderImageFromDb.loading}
        removeFile={removeFile}
      />
    </>
  )
}
const styles = StyleService.create({
  text: {
    margin: 4
  }
})
export default SelfieWidget
