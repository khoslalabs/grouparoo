import { AppStorage } from '../../services/app-storage.service'

const settings = {
  name: 'settings',
  state: {
    language: 'en',
    supportLanguages: {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
      ta: 'Tamil',
      te: 'Telugu',
      mr: 'Marathi',
      bn: 'Bengali'
    },
    isMobileValid: false,
    validatedMobileNumber: '',
    loanAppHelpShown: false,
    loanAgreementHelpShown: false
  },
  selectors: {
    getLanguage: () => (rootState) => rootState.settings.language,
    getIsMobileValid: () => (rootState) => rootState.settings.isMobileValid,
    getValidMobileNumber: () => (rootState) => rootState.settings.validatedMobileNumber,
    getIsApplicationHelpShown: () => (rootState) => rootState.settings.loanAppHelpShown,
    getIsAgreementHelpShown: () => (rootState) => rootState.settings.loanAgreementHelpShown
  },
  reducers: {
    setLanguage: (state, language) => {
      state.language = language
      return state
    },
    setIsMobileValid: (state, { isMobileValid, validatedMobileNumber }) => {
      state.isMobileValid = isMobileValid
      state.validatedMobileNumber = validatedMobileNumber
      return state
    },
    setApplicationHelp: (state, loanAppHelpShown) => {
      state.loanAppHelpShown = loanAppHelpShown
      return state
    },
    setAgreementnHelp: (state, loanAgreementHelpShown) => {
      state.loanAgreementHelpShown = loanAgreementHelpShown
      return state
    }
  },
  effects: (dispatch) => ({
    async setApplicationHelpShown (loanAppHelpShown, rootState) {
      await AppStorage.setLoanApplicationHelpShown(loanAppHelpShown)
      dispatch.settings.setApplicationHelp(loanAppHelpShown)
    },
    async loadLoanApplicationHelpShown (_, rootState) {
      const loanAppHelpShown = await AppStorage.getLoanApplicationHelpShown()
      dispatch.settings.setApplicationHelp(loanAppHelpShown)
    },
    async getIsAgreementHelpShown (_, rootState) {
      const loanAppHelpShown = await AppStorage.getLoanAgreementHelpShown()
      dispatch.settings.setAgreementnHelp(loanAppHelpShown)
    },
    async setAgreementHelpShown (agreementHelpShown, rootState) {
      await AppStorage.setLoanAgreementnHelpShown(agreementHelpShown)
      dispatch.settings.setAgreementnHelp(agreementHelpShown)
    }
  })
}

export default settings
