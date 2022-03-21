import React, { useState, useContext } from 'react'
import { View } from 'react-native'
import isEmpty from 'lodash.isempty'
import {
  useStyleSheet,
  StyleService,
  Button} from '@ui-kitten/components'
import dayjs from 'dayjs'
import useAppState from 'react-native-appstate-hook'
import { config } from '../../../../../config'
import apiService from '../../../../../apiService'
import JSonSchemaForm from './JsonSchemaForm'
import { getSchemaForStep, findStepForFormData } from './utils'
import SpinnerButton from '../../../SpinnerButton'
import styleConstants from '../../styleConstants'
import { LocalizationContext } from '../../translation/Translation'
import appConstants from '../../constants/appConstants'
import { useSelector } from 'react-redux'
import ResourceFactoryConstants from '../../services/ResourceFactoryConstants'
import DataService from '../../services/DataService'
import merge from 'lodash/merge'
import IconUtil from '../common/IconUtil'
import crashlytics from '@react-native-firebase/crashlytics'
import ErrorUtil from '../../../../Errors/ErrorUtil'
import FormSuccess from './FormSuccess'
const FIRST_STEP_INDEX = 1
const finalformObject = {}
const JsonSchemaMultiStepForm = ({
  formData,
  schema,
  uiSchema,
  errorSchema,
  steps,
  onChange,
  liveValidate,
  setLiveValidate,
  formId,
  stepSchemaName,
  token
}) => {
  useAppState({
    onBackground: () => apiService.appApi.stateEvents.send({
      customerId,
      appStatus: 'background',
      createdOn: dayjs().valueOf(),
      eventTypeId: config.EVENT_DROPOFF
    })
  })
  const tempId = useSelector((state) => state?.formDetails?.tempId)
  const customerId = useSelector((state) => state?.customer?.customerDetails?.$id)

  const [finalSaveMessageVisibility, setFinalSaveMessageValidity] =
    useState(false)
  const resourseFactoryConstants = new ResourceFactoryConstants()
  const styles = useStyleSheet(themeStyles)
  const isPanVerified = useSelector(
    (state) => state?.formDetails?.isPanVerified
  )
  const isUdyamVerified = useSelector(
    (state) => state?.formDetails?.isUdyamVerified
  )
  const isGstVerified = useSelector(
    (state) => state?.formDetails?.isGSTVerified
  )
  const isBankStatementVerified = useSelector(
    (state) => state?.formDetails?.isBankStatementVerified
  )
  const isKycDone = useSelector(
    (state) => state?.formDetails?.formData[appConstants.okycField]
  )
  const kycData = useSelector((state) => state?.formDetails?.kycData)

  const gstnData = useSelector((state) => state?.formDetails?.gstnData)
  const panData = useSelector((state) => state?.formDetails?.panData)

  const udyamData = useSelector((state) => state?.formDetails?.udyamData)
  const bankStatementData = useSelector((state) => state?.formDetails?.bankStatementData)
  let thisFormRef
  const { translations } = useContext(LocalizationContext)
  const thisStep = findStepForFormData(steps, formData)
  const [currentStep, setCurrentStep] = useState(thisStep)
  const [isSubmit, setIsSubmit] = useState(false)
  const [newErrorSchema, setNewErrorSchema] = useState(errorSchema)
  const [loaderVisibility, setLoaderVisibility] = useState(false)
  const totalSteps = Object.keys(steps).length
  const step = steps[currentStep.toString()]
  step.liveValidate = isSubmit
  const onSubmit = (form, stepIndex) => {
    setLiveValidate(false)
    const { errors, errorSchema, formData } = form
    if (errors && errors.length > 0) {
      return
    }
    setIsSubmit(true)
    // If all well, move to next step
    if (isEmpty(errors)) {
      saveOrUpdateFormData(
        formData,
        stepIndex === totalSteps ? 'complete' : 'inprogress',
        stepIndex,
        token
      )
    } else {
      setNewErrorSchema(errorSchema)
    }
  }

  const addRequiredData = (requestBody, currentStep, stepsSchema) => {
    const stepFields = stepsSchema[currentStep].stepFields
    for (const field of stepFields) {
      if (field === appConstants.panCardInputFieldName) {
        requestBody[appConstants.isPANVerified] =
          isPanVerified === 'Yes' ? 'Yes' : 'No'
        requestBody.panData = panData
      } else if (field === appConstants.udyamInputFieldName) {
        requestBody[appConstants.isUdyamVerified] =
          isUdyamVerified === 'Yes' ? 'Yes' : 'No'
        requestBody.udyamData = udyamData
      } else if (field === appConstants.gstnInputFieldName) {
        requestBody.gstnData = gstnData
        requestBody[appConstants.isGSTVerified] =
          isGstVerified === 'Yes' ? 'Yes' : 'No'
      } else if (field === appConstants.bankStatementUploadFieldName) {
        requestBody[appConstants.isBankStatementVerified] =
          isBankStatementVerified === 'Yes' ? 'Yes' : 'No'
        requestBody.bankStatementData = bankStatementData
      } else if (
        field === appConstants.isCommunicationAddSameAsPermanentAddress
      ) {
        if (
          requestBody[appConstants.isCommunicationAddSameAsPermanentAddress]
        ) {
          requestBody[appConstants.communicationAddressField] =
          kycData?.data?.address
        }
      } else if (field === appConstants.okycField && !isEmpty(kycData)) {
        requestBody.kycData = kycData
      }
    }
  }

  const saveOrUpdateFormData = (formData, status, stepIndex, token) => {
    setLoaderVisibility(true)
    const requestDataToUpdate = getRequestPayload(formId, formData, token)
    const url = resourseFactoryConstants.constants.forms.saveActionForm
    if (status === 'inprogress') {
      requestDataToUpdate.progress = 'INCOMPLETE'
    } else if (status === 'complete') {
      requestDataToUpdate.progress = 'COMPLETE'
    }
    // requestDataToUpdate.loanApplicationId = tempId
    crashlytics().log(ErrorUtil.createLog('Request body at this step', requestDataToUpdate, 'saveOrUpdateFormData', 'JsonSchemaMultiStepForm.js'))
    DataService.postData(`${url}`, requestDataToUpdate)
      .then((res) => {
        res = res?.data
        if (res?.status === 'SUCCESS') {
          if (currentStep === totalSteps) {
            // Put Condition if any special page need to be redirected
            setFinalSaveMessageValidity(true)
            setLoaderVisibility(false)
          } else {
            setCurrentStep(stepIndex + 1)
          }
        } else {
          if (currentStep > totalSteps) {
            setFinalSaveMessageValidity(true)
            setLoaderVisibility(false)
            return
          }
          crashlytics().log(res.message)
          throw new Error('CANNOT_POST_TO_NOCODE_SERVER')
        }
        setLoaderVisibility(false)
      })
      .catch((err) => {
        crashlytics().recordError(err)
        setLoaderVisibility(false)
        throw err
      })
  }

  const getRequestPayload = (formId, formData, token) => {
    const requestData = {}
    requestData.formName = formId
    requestData.stepSchemaName = stepSchemaName
    requestData.currentStep = currentStep.toString()
    requestData.data = formData
    // add some optional data
    addRequiredData(requestData.data, currentStep, steps)
    // add some optional data
    requestData.param = {
      jwt: token
    }
    // Saving as backup
    merge(finalformObject, requestData)
    return finalformObject
  }

  const setFormRef = (ref) => {
    thisFormRef = ref
  }
  const onPrevious = () => {
    const step = currentStep - 1
    setCurrentStep(step)
  }
  const onNext = () => {
    // Force a form Submit
    thisFormRef.submit()
  }
  const onError = (errorSchema) => {
    setNewErrorSchema(errorSchema)
  }
  const { newSchema, newUiSchema } = getSchemaForStep({
    schema,
    uiSchema,
    step
  })

  return (
    <>
      {/* <HorizontalProgressBar progressNum={(currentStep * 100) / totalSteps} /> */}
      {!finalSaveMessageVisibility && (
        <View style={styles.container}>
          <JSonSchemaForm
            stepIndex={currentStep}
            setFormRef={setFormRef}
            onError={onError}
            schema={newSchema}
            uiSchema={newUiSchema}
            onSubmit={onSubmit}
            formData={formData}
            errorSchema={newErrorSchema}
            liveValidate={liveValidate}
            onChange={onChange}
          />
          <View style={styles.buttonContainer}>
            <Button
              style={styles.buttonStyle}
              onPress={onPrevious}
              status='basic'
              disabled={currentStep === FIRST_STEP_INDEX}
              accessoryLeft={() => <IconUtil.BackIcon />}
            >
              {translations['form.previous']}
            </Button>

            {currentStep < totalSteps && (
              <SpinnerButton
                style={styles.buttonStyle}
                loading={loaderVisibility}
                onPress={onNext}
                Icon={IconUtil.NextIcon}
              >
                {translations['form.next']}
              </SpinnerButton>
            )}
            {currentStep === totalSteps && (
              <SpinnerButton
                style={styles.buttonStyle}
                loading={loaderVisibility}
                onPress={onNext}
              >
                {translations['form.submit']}
              </SpinnerButton>
            )}
          </View>
        </View>
      )}
      {finalSaveMessageVisibility && (
        <FormSuccess />
      )}
    </>
  )
}

const themeStyles = StyleService.create({
  successText: {
    fontWeight: 'bold',
    fontSize: 25
  },
  successDescriptionText: {
    fontSize: 20
  },
  finalMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonStyle: {
    width: '48.5%'
  },
  buttonContainer: {
    flexDirection: 'row',
    verticalPadding: 8,
    justifyContent: 'space-between',
    backgroundColor: 'background-basic-color-1',
    height: 50
  },
  container: {
    ...styleConstants.contentContainer,
    alignSelf: 'stretch',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
})

export default JsonSchemaMultiStepForm
