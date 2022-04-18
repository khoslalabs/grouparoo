import dayjs from 'dayjs'
import isEmpty from 'lodash.isempty'
import isUndefined from 'lodash.isundefined'
import apiService from '../../../apiService'
import maxBy from 'lodash.maxby'
import { config } from '../../../config'
import ResourceFactoryConstants from '../../../screens/components/React-json-schema-form/services/ResourceFactoryConstants'
import DataService from '../../../screens/components/React-json-schema-form/services/DataService'

const addLoanAplication = (state, loanApplication) => {
  if (loanApplication.data.status === 'ACTIVE') {
    state.activeLoanApplicationIds = [loanApplication.data.loanApplicationId, ...state.activeLoanApplicationIds]
    if (isEmpty(state.applications)) {
      // This is the first application
      state.currentLoanApplicationId = loanApplication.data.loanApplicationId
    }
  }
  state.applications[loanApplication.data.loanApplicationId] = loanApplication.data
  return state
}
const addLoanApplications = (state, { loanApplications }) => {
  if (!isEmpty(loanApplications)) {
    const activeLoanApplicationIds = []
    if (!isUndefined(loanApplications)) {
      loanApplications.forEach(la => {
        const { data, ...rest } = la
        // FIXME: remove this when done
        rest.processState = 'cpvInitiated'
        state.applications[data.loanApplicationId] = data
        state.applicationStage[data.loanApplicationId] = rest
        if (la.status === 'ACTIVE') {
          activeLoanApplicationIds.push(la.data.loanApplicationId)
        }
      })
      if (loanApplications.length > 0) {
        // set the latest createdOn object as latest Loan Application
        const latestLoanApplication = maxBy(loanApplications, 'createdOn')
        state.currentLoanApplicationId = latestLoanApplication.data.loanApplicationId
      }
      state.activeLoanApplicationIds = activeLoanApplicationIds
      return state
    }
    return state
  }
  return state
}
const loanApplications = {
  name: 'loanApplications',
  state: {
    activeLoanApplicationIds: [],
    currentLoanApplicationId: undefined,
    applications: {},
    applicationStage: {}
  },
  selectors: {
    getLoanApplicationStage: select => (rootState, { loanApplicationId }) => {
      return rootState.loanApplications.applicationStage[loanApplicationId]
    },
    getCurrentLoanApplication: select => (rootState) => {
      const loanApplications = rootState.loanApplications
      if (!isUndefined(loanApplications.currentLoanApplicationId)) {
        const loanApplication = loanApplications.applications[loanApplications.currentLoanApplicationId]
        return loanApplication
      }
    },
    hasAnyLoanApplication: select => (rootState) => {
      return !isEmpty(rootState.loanApplications.applications)
    },
    getApplicationById: select => (rootState, id) => {
      const loanApplication = rootState.loanApplications.applications[id]
      return loanApplication
    },
    getActiveLoanApplications: select => rootState => {
      const activeLoanApplicationIds = rootState.loanApplications.activeLoanApplicationIds
      return activeLoanApplicationIds.map(aid => rootState.loanApplications.applications[aid])
    },
    getAllLoanApplications: select => rootState => {
      return Object.keys(rootState.loanApplications.applications).map(ky => rootState.loanApplications.applications[ky])
    },
    getLoanAmount: select => (rootState, { loanApplicationId }) => {
      return rootState.loanApplications.applications[loanApplicationId].loanAmount
    },
    getStartDate: select => (rootState, { loanApplicationId }) => {
      const createdAt = rootState.loanApplications.applications[loanApplicationId].createdOn
      return dayjs(createdAt).format('DD-MMM-YYYY')
    },
    getLoanDetailsForApplication: select => (rootState, { loanApplicationId }) => {
      const loanApplication = rootState.loanApplications.application[loanApplicationId]
      const loan = select.loans.getLoanById({
        loanApplicationId: loanApplication.loanApplicationId
      })
      return loan
    }
  },
  reducers: {
    // Called only while registering or signing in. Server has the true data
    'customer/setCustomer': addLoanApplications,
    setFormData: (state, { allFormData }) => {
      state.formData = allFormData
    },
    addLoanApplication: (state, { loanApplication }) => {
      state = addLoanAplication(state, loanApplication)
      return state
    },
    addLoanApplications: (state, { loanApplications }) => {
      for (let r = 0; r < loanApplications.length; r++) {
        state = addLoanAplication(state, loanApplications[r])
      }
      return state
    },
    setCurrentLoanApplication: (state, loanApplicationId) => {
      state.currentLoanApplicationId = loanApplicationId
      const newState = Object.assign({}, state)
      return newState
    },
    'loans/addAllLoans': (state, { allLoans }) => {
      if (isUndefined(allLoans)) {
        return state
      }
      allLoans.forEach(al => {
        const loanApp = state.applications[al.loanApplicationId]
        if (loanApp) {
          loanApp.loanId = al.externalLoanId
        }
      })
      return state
    },
    updateLoanApplicationStage: (state, { data, currentStep, status }) => {
      state.applications[data.loanApplicationId] = data
      state.applicationStage[data.loanApplicationId].currentStep = currentStep
      state.applicationStage[data.loanApplicationId].status = status
      return state
    },
    setLoanAgreementId: (state, { loanApplicationId, loanAgreementId }) => {
      const loanApplication = state.applications[loanApplicationId]
      loanApplication.loanAgreementId = loanAgreementId
      state.applications[loanApplicationId] = Object.assign({}, loanApplication)
      return state
    }
  },
  effects: (dispatch) => ({
    async createLoanApplication ({ loanApplicationId }, rootState) {
      const { id, customerDetails } = rootState.customer
      const formData = {
        primaryName: customerDetails.fullName,
        email: customerDetails.primaryEmail,
        primaryPhone: customerDetails.primaryPhone,
        isPrimaryPhoneVerified: 'yes',
        loanApplicationId,
        status: 'ACTIVE',
        customerId: customerDetails.$id
      }
      try {
        const data = await apiService.appApi.loanApplication.create(formData, id)
        const loanApplication = {
          data,
          currentStep: 0,
          progress: 'INCOMPLETE'
        }
        await dispatch.loanApplications.addLoanApplication({ loanApplication })
      } catch (e) {
        console.log(e)
        throw new Error('CANNOT_CREATE_LOAN_APPLICATION')
      }
    },
    async removeLoanApplication ({ loanApplicationId }, rootState) {
      const loanApplication = rootState.loanApplications[loanApplicationId]
      if (!isUndefined(loanApplication)) {
        await apiService.appApi.loans.deleteLoanApplication(rootState)
        dispatch.loanApplications.deleteLoanApplication({ loanApplicationId })
      }
    },
    async generateLoanAgreement ({ loanApplicationId }, rootState) {
      try {
        let loanAgreementId
        if (config.APPWRITE_FUNCTION_CALL) {
          const executionId = await apiService.appApi.loanApplication.loanAgreement.execute(loanApplicationId)
          loanAgreementId = await apiService.appApi.loanApplication.loanAgreement.get(executionId)
        } else {
          const payload = { loanApplicationId }
          const endpoints = new ResourceFactoryConstants()
          const res = await DataService.postData(endpoints.constants.appwriteAlternative.generateLoanAgreement, payload)
          const data = res?.data
          if (data.status === 'FAILED') {
            throw new Error('CANNOT_GET_LOANAGREEMET_ID')
          }
          loanAgreementId = data?.fileId
        }
        dispatch.loanApplications.setLoanAgreementId({ loanAgreementId, loanApplicationId })
      } catch (e) {
        console.log(e)
        throw new Error('CANNOT_GET_LOAN_AGREEMENT_ID')
      }
    },
    async setCurrentLoanApplicationId ({ loanApplicationId }, rootState) {
      try {
        await dispatch.loanApplications.setCurrentLoanApplication(loanApplicationId)
      } catch (error) {
        console.log(error)
        throw new Error('CANNOT_SET_CURRENT_LOAN_APPLICATION_ID')
      }
    }
  })
}
export default loanApplications
