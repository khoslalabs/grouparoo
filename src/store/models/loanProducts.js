import apiService from '../../apiService'
import { config } from '../../config'
import DataService from '../../screens/components/React-json-schema-form/services/DataService'
import ResourceFactoryConstants from '../../screens/components/React-json-schema-form/services/ResourceFactoryConstants'
const loanProducts = {
  name: 'loanProducts',
  state: {
  },
  selectors: {
    list: select => (rootState) => {
      const { loanProducts } = rootState
      return Object.keys(loanProducts).map(ky => loanProducts[ky])
    },
    getProductBySchemeCode: select => (rootState, { schemeCode, schemeName }) => {
      const lps = select.loanProducts.list(rootState)
      return lps.find(lp => lp.schemeCode === schemeCode)
    },
    getProductDisplayName: select => (rootState, { schemeCode, productCode }) => {
      const product = select.loanProducts.getProductBySchemeCode(rootState, { schemeCode, productCode })
      const name = product.loanType.name
      return name
    },
    getInterestFrequency: select => (rootState, { schemeCode, schemeName }) => {
      const product = select.loanProducts.getProductBySchemeCode(rootState, { schemeCode, schemeName })
      const rpMode = product.repaymentMode.repaymentMode
      let interestFrequency
      if (rpMode === config.REPAYMENT_UPFRONT_EQUATED || rpMode === config.REPAYMENT_UPFRONT_AMORTIZED) {
        interestFrequency = `period.${interestFrequency}ly.upfront`
      } else if (rpMode === config.REPAYMENT_BULLET_BEGINNING) {
        interestFrequency = 'period.paidUpfront'
      } else if (rpMode === config.REPAYMENT_BULLET_END) {
        interestFrequency = 'period.paidAtend'
      }
      return interestFrequency
    },
    getRepaymentDescription: select => (rootState, { schemeCode, schemeName }) => {
      const product = select.loanProducts.getProductBySchemeCode(rootState, { schemeCode, schemeName })
      const rpMode = product.repaymentMode.repaymentMode

      if (rpMode === config.REPAYMENT_AMORTIZED || rpMode === config.REPAYMNET_EQUATED) {
        return {
          description: 'loan.amortization',
          mode: rpMode
        }
      } else if (rpMode === config.REPAYMENT_UPFRONT_EQUATED || rpMode === config.REPAYMENT_UPFRONT_EQUATED) {
        return {
          principal: 'loan.principalAmount',
          pincipalAndInterest: 'loan.principalAndInterest',
          interest: 'loan.interestAmount',
          mode: rpMode

        }
      } else if (rpMode === config.REPAYMENT_BULLET_END) {
        return {
          description: 'loan.repaymentAmount',
          principal: 'loan.principalAmount',
          interest: 'loan.interestAmount',
          mode: rpMode

        }
      } else if (product.interestRepaymentMode === config.REPAYMENT_BULLET_BEGINNING) {
        return {
          principal: 'loan.principalAmount',
          mode: rpMode
        }
      }
    },
    getRepaymentFrequencyForDisplay: select => (rootState, { schemeCode, schemeName }) => {
      const product = select.loanProducts.getProductBySchemeCode(rootState, { schemeCode, schemeName })
      if (product.interestRepaymentMode === config.REPAYMENT_AMORTIZED) {
        return {
          repaymentFrequency: `period.per.${product.interestFrequency}`,
          repaymentMode: `product.repayment.${product.interestRepaymentMode}`
        }
      } else if (product.interestRepaymentMode === config.REPAYMNET_UPFRONT) {
        return {
          repaymentMode: `product.repayment.${product.interestRepaymentMode}`,
          interestFrequency: `period.per.${product.interestFrequency}`,
          principalFrequency: `period.per.${product.principalFrequency}`,
          repaymentModeInterest: `product.repayment.interest.${product.interestRepaymentMode}`,
          repaymentModePrincipal: `product.repayment.principal.${product.interestRepaymentMode}`
        }
      } else if (product.interestRepaymentMode === config.REPAYMENT_BULLET_END) {
        return {
          repaymentMode: `product.repayment.${product.interestRepaymentMode}`,
          repaymentModeInterest: `product.repayment.interest.${product.interestRepaymentMode}`,
          repaymentModePrincipal: `product.repayment.principal.${product.interestRepaymentMode}`
        }
      } else if (product.interestRepaymentMode === config.REPAYMENT_BULLET_BEGINNING) {
        return {
          repaymentMode: `product.repayment.${product.interestRepaymentMode}`,
          repaymentFrequency: `product.repayment.interest.${product.interestRepaymentMode}`
        }
      } else {
        return {}
      }
    }
  },
  reducers: {
    setLoanProducts: (state, { products }) => {
      products.forEach(pr => {
        state[pr.id] = pr
      })
      state.schemeCodes = products.map(p => p.schemeCode)
      return state
    }
  },
  effects: (dispatch) => ({
    async getAllProducts (_, rootState) {
      try {
        let products
        if (config.APPWRITE_FUNCTION_CALL) {
          const executionId = await apiService.appApi.loanProducts.getAll.execute()
          products = await apiService.appApi.loanProducts.getAll.get(executionId)
        } else {
          const endpoints = new ResourceFactoryConstants()
          const res = await DataService.postData(endpoints.constants.appwriteAlternative.getLoanProducts)
          products = res.data
        }
        dispatch.loanProducts.setLoanProducts({ products })
      } catch (e) {
        throw new Error(e.message)
      }
    }
  })
}

export default loanProducts
