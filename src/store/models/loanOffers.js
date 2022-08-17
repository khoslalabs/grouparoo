import apiService from '../../apiService'
import { config } from '../../config'
import DataService from '../../screens/components/React-json-schema-form/services/DataService'
import ResourceFactoryConstants from '../../screens/components/React-json-schema-form/services/ResourceFactoryConstants'
const loanOffers = {
  name: 'loanOffers',
  state: {

  },
  selectors: {
    getAllOffers: select => (rootState, loanApplicationId) => {
      return rootState.loanOffers[loanApplicationId]
    }
  },
  reducers: {
    setLoanOffers: (state, { loanOffers, loanApplicationId }) => {
      state[loanApplicationId] = loanOffers
      return state
    }
  },
  effects: (dispatch) => ({
    async getOffersForApplication ({ loanApplicationId }, rootState) {
      try {
        let loanOffers
        if (config.APPWRITE_FUNCTION_CALL) {
          const executionId = await apiService.appApi.loanApplication.getAllOffers.execute(loanApplicationId)
          loanOffers = await apiService.appApi.loanApplication.getAllOffers.get(executionId)
        } else {
          const endpoints = new ResourceFactoryConstants()
          const res = await DataService.postData(endpoints.constants.appwriteAlternative.indicativeLoanOffers, { loanApplicationId })
          loanOffers = res.data
        }
        dispatch.loanOffers.setLoanOffers({ loanOffers, loanApplicationId })
      } catch (err) {
        throw new Error(err.message)
      }
    }
  })
}

export default loanOffers
