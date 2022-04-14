import React, { useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import ReactJsonSchemaUtil from '../../services/ReactJsonSchemaFormUtil'

import { RNForm } from '../extLibraries/JsonSchemaForm'
const JsonSchemaForm = props => {
  const dispatch = useDispatch()
  const {
    formData,
    schema,
    uiSchema,
    onSubmit,
    liveValidate,
    stepIndex,
    onError,
    setFormRef,
    validate,
    onChange
  } = props
  const [rnFormData, setRnFormdata] = useState(formData || {})
  const [cntxt, setContext] = useState()
  const onFormDataUpdateHandler = (event) => {
    setRnFormdata(event.formData)
    dispatch.formDetails.setFormData(event.formData)
    onChange(event)
  }

  return (
    <KeyboardAwareScrollView>
      <RNForm
        ref={form => {
          setFormRef(form)
          setContext(form)
        }}
        onError={onError}
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={form => onSubmit(form, stepIndex)}
        formData={rnFormData || {}}
        liveValidate={liveValidate}
        validate={validate}
        onChange={onFormDataUpdateHandler}
        formContext={cntxt}
        showErrorList={false}
        transformErrors={ReactJsonSchemaUtil.transformErrors}
      >
        {props.children}
      </RNForm>
    </KeyboardAwareScrollView>
  )
}

export default JsonSchemaForm
