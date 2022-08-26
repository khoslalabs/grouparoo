const appConstants = {
  // default formName and StepName for App
  defaultFormName: 'onboarding_test',
  defaultStepName: 'onboarding_test_mob',
  authToken: 'c1cc9167-277c-4dd7-bf51-488310860699',
  // ------Set Pre Populate Data Key Name
  businessVintage: 'businessVintage',
  primaryName: 'primaryName',
  annualSales: 'annualSales',
  gstn: 'gstn',
  isGSTVerified: 'isGSTVerified',
  isPANVerified: 'isPANVerified',
  isUdyamVerified: 'isUdyamVerified',
  isPrimaryPhoneVerified: 'isPrimaryPhoneVerified',
  isBankStatementVerified: 'isBankStatementVerified',
  // ---Set default field Name for gst,Pan,udyam,
  panCardInputFieldName: 'pan',
  udyamInputFieldName: 'udyamAadhar',
  gstnInputFieldName: 'gstn',
  bankStatementUploadFieldName: 'bankStatement',
  okycField: 'isKYCDone',
  // ---Set default field Name for gst,Pan,udyam,

  // is Address fetched by aadhar is same as communication address
  isCommunicationAddSameAsPermanentAddress:
    'isCommunicationAddSameAsPermanentAddress',
  communicationAddressField: 'communicationAddress',
  finboxApiKey: '73qqTni5iE4yexhz0sL9PHlwgHR9nvqHqHV8DKzb',
  paymentMethod:["UPI Payment","IMPS","NEFT","other"],

}

export default appConstants
