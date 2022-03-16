const formDetails = {
  name: 'formDetails',
  state: {
    formData: {},
    schema: {},
    uiSchema: {},
    steps: {},
    currentStepNumber: 1,
    verifiedPhoneNumber: '',
    verifiedGstNumber: '',
    isGSTVerified: '',
    isPrimaryPhoneVerified: '',
    isPanVerified: '',
    isUdyamVerified: '',
    isBankStatementVerified: '',
    panFile: undefined,
    bankStatementFiles: [],
    aadharFrontFile: undefined,
    aadharBackFile: undefined,
    okycSelfieFile: undefined,
    selfieFile: undefined,
    loanAmount: undefined,
    itrFiles: [],
    // Adapter Response
    panData: {},
    gstnData: {},
    udyamData: {},
    kycData: {},
    // tempId for application
    tempId: String(Math.floor(100000 + Math.random() * 900000)),
  },
  selectors: {
    getPanFile: select => (rootState) => rootState.formDetails.panFile,
    // give a copy of the state
    getBankStatementFiles: select => (rootState) => rootState.formDetails.bankStatementFiles,
    getItrFiles: select => (rootState) => rootState.formDetails.itrFiles

  },
  reducers: {
    setSchemaDetails: (state, { schema, uiSchema, steps, formData }) => {
      state.schema = schema
      state.uiSchema = uiSchema
      state.steps = steps
      state.formData = formData
      return state
    },
    setLoanAmount: (state, loanAmount) => {
      state.loanAmount = loanAmount
      return state
    },
    setItrFiles: (state, files) => {
      state.itrFiles = files
      return state
    },
    removeItrFiles: (state, removeFile) => {
      const newStatements = state.itrFiles.filter(f => f.uri !== removeFile.uri)
      state.itrFiles = [...newStatements]
      return state
    },
    setIsBankStatementVerified: (state, payload) => {
      return {
        ...state,
        isBankStatementVerified: payload
      }
    },
    setIsUdyamVerified: (state, payload) => {
      return {
        ...state,
        isUdyamVerified: payload
      }
    },
    setSelfieFile: (state, selfieFile) => {
      state.selfieFile = selfieFile
      return state
    },
    setIsPanVerified: (state, payload) => {
      return {
        ...state,
        isPanVerified: payload
      }
    },
    setIsPrimaryPhoneVerified: (state, payload) => {
      return {
        ...state,
        isPrimaryPhoneVerified: payload
      }
    },
    setverifiedPhoneNumber: (state, payload) => {
      return {
        ...state,
        verifiedPhoneNumber: payload
      }
    },
    setverifiedGstNumber: (state, payload) => {
      return {
        ...state,
        verifiedGstNumber: payload
      }
    },
    setIsGSTVerified: (state, payload) => {
      return {
        ...state,
        isGSTVerified: payload
      }
    },
    setOkycSelfieFile: (state, okycSelfieFile) => {
      state.okycSelfieFile = okycSelfieFile
      return state
    },
    setPanFile: (state, panFile) => {
      state.panFile = panFile
      return state
    },
    setBankStatementFiles: (state, bankStatementFiles) => {
      state.bankStatementFiles = [...state.bankStatementFiles, ...bankStatementFiles]
      return state
    },
    removeFromBankStatementFiles: (state, removeFile) => {
      const newStatements = state.bankStatementFiles.filter(f => f.uri !== removeFile.uri)
      state.bankStatementFiles = [...newStatements]
      return state
    },
    setAadharFrontFile: (state, aadharFrontFile) => {
      state.aadharFrontFile = aadharFrontFile
      return state
    },
    setAadharBackFile: (state, aadharBackFile) => {
      state.aadharBackFile = aadharBackFile
      return state
    },
    setFormData: (state, payload) => {
      return {
        ...state,
        formData: payload
      }
    },
    setSchema: (state, payload) => {
      return {
        ...state,
        schema: payload
      }
    },
    setUiSchema: (state, payload) => {
      return {
        ...state,
        uiSchema: payload
      }
    },
    setStep: (state, payload) => {
      return {
        ...state,
        step: payload
      }
    },
    setPanData: (state, payload) => {
      return {
        ...state,
        panData: payload
      }
    },
    setGstnData: (state, payload) => {
      return {
        ...state,
        gstnData: payload
      }
    },
    setUdyamData: (state, payload) => {
      return {
        ...state,
        udyamData: payload
      }
    },
    setaadharData: (state, { kycData, kycMatchData }) => {
      state.kycData = kycData
      state.kycMatchData = kycMatchData
      return state
    },
    // Once I am reloading the form from saved data, need to reload the redux store too
    setAllAdditionalData: (state, { panData, gstnData, udyamData, kycData }) => {
      state.panData = panData
      state.gstnData = gstnData
      state.udyamData = udyamData
      state.kycData = kycData
      state.kycMatchData = kycData?.kycMatchData
      return state
    }
  },
  effects: (dispatch) => ({
    updateAllAdditionalData (_, rootState) {
      try {
        const currentLoanApplicationId = rootState.loanApplications.currentLoanApplicationId
        const currentLoanApplication = rootState.loanApplications.applications[currentLoanApplicationId]
        const { panData, gstnData, udyamData, kycData } = currentLoanApplication
        dispatch.formDetails.setAllAdditionalData({ panData, gstnData, udyamData, kycData })
      } catch (error) {
        throw new Error(error.message)
      }
    }
  })
}
export default formDetails
