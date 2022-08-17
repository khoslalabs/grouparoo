import React, { useState } from 'react'
import { View } from 'react-native'
import isEmpty from 'lodash.isempty'
import { useDispatch, useSelector } from 'react-redux'
import { useRequest } from 'ahooks'
import { StyleService, useStyleSheet } from '@ui-kitten/components'
import JsonSchemaMultiStepForm from '../components/Forms/JsonSchemaMultiStepForm'
import styleConstants from '../styleConstants'
import DataService from '../services/DataService'
import ResourceFactoryConstants from '../services/ResourceFactoryConstants'
import LoadingSpinner from '../../../components/LoadingSpinner'

const errors = {}
const resourseFactoryConstants = new ResourceFactoryConstants()

const loadApplicationFormSchema = async (dispatch, formId, stepSchemaName, formData) => {
  const url = `${resourseFactoryConstants.constants.forms.getSchemaAndStepsByName}?formName=${formId}&schemaSteps=${stepSchemaName}`
  try {
    const response = await DataService.getData(url)
    if (response.data.status !== 'SUCCESS') {
      throw new Error('INCORRECT_FORM_ID')
    }
    const res = response.data
    if (
      res?.jsonSchema &&
      res?.uiSchema?.values &&
      res?.schemaSteps?.steps
    ) {
      return dispatch.formDetails.setSchemaDetails({
        schema: res.jsonSchema,
        uiSchema: res.uiSchema.values,
        steps: res.schemaSteps.steps,
        formData: formData
      })
    } else {
      throw new Error('INCORRECT_FORM_ID')
    }
  } catch (err) {
    console.log(err.message)
    throw new Error('CANNOT_CONNECT_NO_CODE_SERVER')
  }
}

const ApplicationForm = (props) => {
  const { formId, stepSchemaName, token, currentFormData } = props
  // const [formData, setFormData] = useState(currentFormData)
  const [liveValidate, setLiveValidate] = useState(false)
  const styles = useStyleSheet(themedStyles)
  const dispatch = useDispatch()
  const {
    steps,
    schema,
    uiSchema,
    formData
  } = useSelector(state => state.formDetails)
  const { error, loading } = useRequest(() => loadApplicationFormSchema(
    dispatch,
    formId,
    stepSchemaName,
    currentFormData))

  if (loading) {
    return <LoadingSpinner />
  }
  if (error) {
    throw error
  }
  if (isEmpty(schema) || isEmpty(uiSchema)) {
    throw new Error('EMPTY_JSON_SCHEMA')
  }
  // Throw the errors so that error handler can show something went wrong
  const onError = () => { }
  const onChangeHandler = (event) => {
    if (event.errors) {
      if (event.errors.length > 0) {
        setLiveValidate(true)
      } else if (event.errors.length === 0) {
        setLiveValidate(false)
      }
    }
  }

  return (
    <View style={styles.container}>
      <JsonSchemaMultiStepForm
        schema={schema}
        errorSchema={errors}
        uiSchema={uiSchema}
        steps={steps}
        formData={formData}
        onError={onError}
        onChange={onChangeHandler}
        setLiveValidate={setLiveValidate}
        liveValidate={liveValidate}
        formId={formId}
        stepSchemaName={stepSchemaName}
        token={token}
        navigation={props.navigation}
      />
    </View>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    ...styleConstants.container,
    marginHorizontal: 8
  }
})
export default ApplicationForm
