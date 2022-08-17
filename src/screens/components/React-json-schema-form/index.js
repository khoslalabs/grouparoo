import React, { useContext } from 'react'
import { LocalizationContext } from './translation/Translation'
import ApplicationForm from './ApplicationForm'

const ReactNativeJsonSchemaForm = (props) => {
  const { initializeAppLanguage } = useContext(LocalizationContext)
  initializeAppLanguage()
  return (
    <>
      <ApplicationForm
        formId={props.formId}
        stepSchemaName={props.stepSchemaName}
        token={props.token}
        currentFormData={props.currentFormData}
        navigation={props.navigation}
      />
    </>
  )
}

export default ReactNativeJsonSchemaForm
