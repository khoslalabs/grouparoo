import { AppStorage } from '../../services/app-storage.service'
import isUndefined from 'lodash.isundefined'
import crashlytics from '@react-native-firebase/crashlytics'
import apiService from '../../apiService'
import { config } from '../../config'
import { getAppFcmToken } from '../../services/push.notifications'
const authentication = {
  name: 'authentication',
  state: {
    isLoggedIn: false, // FIXME: Made this true for things to work
    id: '',
    userName: '',
    isFirstTime: true,
    accountExists: false
  },
  selectors: {
    isUserLoggedIn: select => (rootState) => {
      return rootState.authentication.isLoggedIn
    },
    isFirstTime: select => (rootState) => {
      return rootState.authentication.isFirstTime
    }
  },
  reducers: {
    'customer/setCustomer': (state, { customer, isFirstTime }) => {
      state.isLoggedIn = true
      state.id = customer.$id
      state.userName = customer.email
      state.isFirstTime = isFirstTime
      return state
    },
    loginFailed: (state, { isFirstTime, accountExists }) => {
      state.isLoggedIn = false
      state.isFirstTime = isFirstTime
      state.accountExists = accountExists
      return state
    },
    updateAccountExistsFlag: (state) => {
      state.accountExists = false
      return state
    }
  },
  effects: dispatch => ({
    async signInUser ({ email, password }, rootState) {
      try {
        const isFirstTime = await AppStorage.getIsFirstTime('default')
        const customer = await apiService.appApi.auth.login(email, password)
        await commonAuthenticateSteps(dispatch, customer, isFirstTime)
        // const customerDetails = await apiService.appApi.customer.getCustomerByUserId(customer.$id)
        // const loanApplications = await apiService.appApi.loanApplication.getAllLoanApplications(customerDetails.$id)
        // Promise.all([
        //   dispatch.customer.setCustomer({ customer, isFirstTime, customerDetails, loanApplications }),
        //   dispatch.loanProducts.getAllProducts(),
        //   dispatch.loanTypes.getAllLoanTypes(),
        //   dispatch.borrowingEntities.getBorrowingEntities()
        // ])
      } catch (e) {
        // FIXME: Endpoint to push errors
        console.log(e)
        return dispatch.appStates.setSigninError({ signinError: true })
      }
    },
    async checkAndAuthenticateUser (payload, rootState) {
      let isFirstTime = await AppStorage.getIsFirstTime('default')
      isFirstTime = isFirstTime === 'default' ? true : isFirstTime
      if (isFirstTime) {
        return dispatch.authentication.loginFailed({ isFirstTime })
      }
      try {
        const customer = await apiService.appApi.user.get()
        await AppStorage.setFirstTime(false)
        await commonAuthenticateSteps(dispatch, customer, isFirstTime)
      } catch (e) {
        // Not logged in or not registered.
        console.log(e)
        dispatch.authentication.loginFailed({ isFirstTime })
      }
    },
    async registerOrUpdateUser ({ formData, password }, rootState) {
      // Can be an existing user or a new user
      // first try to login with default password
      const isFirstTime = await AppStorage.getIsFirstTime('default')
      let customer
      try {
        customer = await apiService.appApi.auth.login(formData.email, config.DEFAULT_PASSWORD)
        await apiService.appApi.user.updatePassword(password)
        await AppStorage.setFirstTime(false)
      } catch (e) {
        /// Probably user does not exist in the system
        try {
          customer = await apiService.appApi.auth.register({
            email: formData.email,
            password,
            fullName: formData.fullName
          })
          await AppStorage.setFirstTime(false)
        } catch (e) {
          // now something is really wrong
          let accountExists = false
          console.log(e.stack)
          if (e.message === 'ACCOUNT_EXISTS') {
            accountExists = true
          }
          return dispatch.authentication.loginFailed({ isFirstTime, accountExists })
        }
        // Now that we have the customer, we need to also get the customer details
        const prefs = await apiService.appApi.preferences.set({
          langauage: 'en',
          theme: 'light'
        })
        customer.prefs = prefs
        try {
          let customerDetails
          customerDetails = await apiService.appApi.customer.getCustomerByUserId(customer.$id)
          if (Object.keys(customerDetails).length === 0) {
            // Create new customer in the database.
            let fcmId = await AppStorage.getFcmToken('default')
            // This should not be default
            if (fcmId === 'default') {
              // Get fcmId again here
              fcmId = await getAppFcmToken()
              await AppStorage.setFcmToken(fcmId)
            }
            customerDetails = await apiService.appApi.customer.create({
              userId: customer.$id,
              name: formData.fullName,
              primaryEmail: formData.email,
              email: formData.email,
              primaryPhone: formData.primaryPhone,
              isPrimaryPhoneVerified: formData.isPrimaryPhoneVerified || 'no',
              fcmId
            }, customer.$id)
          }
          commonAuthenticateSteps(dispatch, customer, isFirstTime, customerDetails)
        } catch (e) {
          console.log(e.stack)
          throw new Error('CANNOT_CREATE_CUSTOMER_DETAILS')
        }
      }
    },
    async resetAccountExistsFlag () {
      await dispatch.authentication.updateAccountExistsFlag()
    },
    async reloadTheFormWithLatestData (_, rootState) {
      const customer = rootState?.customer
      const customerDetails = customer?.customerDetails
      const loanApplications = await getAllLoanApplications(customerDetails.$id)
      await Promise.all([
        dispatch.customer.setCustomer({
          customer,
          isFirstTime: false,
          customerDetails,
          loanApplications,
          prefs: customer.prefs
        })
      ])
    }
  })
}
const commonAuthenticateSteps = async (dispatch, customer, isFirstTime, customerDetails) => {
  if (isUndefined(customerDetails)) {
    customerDetails = await apiService.appApi.customer.getCustomerByUserId(customer.$id)
  }
  const loanApplications = await getAllLoanApplications(customerDetails.$id)
  console.log('loanApplications', loanApplications)
  await Promise.all([
    dispatch.customer.setCustomer({
      customer,
      isFirstTime,
      customerDetails,
      loanApplications,
      prefs: customer.prefs
    }),
    dispatch.loanProducts.getAllProducts(),
    dispatch.loanTypes.getAllLoanTypes(),
    dispatch.borrowingEntities.getBorrowingEntities()
  ])
  if (isUndefined(loanApplications) || loanApplications.length === 0) {
    // Create a new loan application for this user and set it
    const loanApplicationId = await createLoanApplication()
    await dispatch.loanApplications.createLoanApplication({ loanApplicationId })
  }
  // Need to set all these Data like gstn,pan,kyc,udyam etc
  await dispatch.formDetails.updateAllAdditionalData()
}
const getAllLoanApplications = async (customerId) => {
  try {
    const executionId = await apiService.appApi.loanApplication.getAllLoanApplications.execute(customerId)
    const loanApplications = await apiService.appApi.loanApplication.getAllLoanApplications.get(executionId)
    return loanApplications
  } catch (err) {
    crashlytics().log(err)
    throw err
  }
}
const createLoanApplication = async () => {
  const executionId = await apiService.appApi.loanApplication.createLoanApplicationId.execute()
  const loanApplicationId = await apiService.appApi.loanApplication.createLoanApplicationId.get(executionId)
  return loanApplicationId
}

export default authentication
