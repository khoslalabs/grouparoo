import apiService from '../../apiService'
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
        const executionId = await apiService.appApi.loanApplication.getAllOffers.execute(loanApplicationId)
        const loanOffers = await apiService.appApi.loanApplication.getAllOffers.get(executionId)
        dispatch.loanOffers.setLoanOffers({ loanOffers, loanApplicationId })
      } catch (err) {
        throw new Error(err.message)
      }
    }
  })
}

export default loanOffers
