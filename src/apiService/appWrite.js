import { Appwrite, Query } from 'appwrite'
import { config } from '../config'
import isUndefined from 'lodash.isundefined'
import isNull from 'lodash.isnull'
import isEmpty from 'lodash.isempty'
import crashlytics from '@react-native-firebase/crashlytics'
import { Gzip } from '../utils'
const sdk = new Appwrite()

const unpackData = (b64Data) => {
  const unzippedData = Gzip.unzip(b64Data)
  return JSON.parse(unzippedData)
}
const isInvalidValue = (val) => {
  return isUndefined(val) || isNull(val) || val === 'np' || val === -1 || val.length === 0
}
// Fill with your Appwrite API endpoint and Project ID!
sdk.setEndpoint(config.appWrite.url).setProject(config.appWrite.projectId)

const getCompletionStatus = async (functionId, executionId) => {
  let completed = false
  let responseWithStatus
  while (!completed) {
    responseWithStatus = await sdk.functions.getExecution(functionId, executionId)
    if (responseWithStatus.status === 'completed' || responseWithStatus === 'failed') {
      completed = true
    }
    if (!completed) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
  return responseWithStatus
}
export const appApi = {
  stateEvents: {
    send: async (appStateEvents) => {
      try {
        await sdk.database.createDocument(
          config.appWrite.appStateEventsCollectionId,
          'unique()',
          appStateEvents
        )
      } catch (err) {
        crashlytics().log(err)
      }
    }
  },
  cashfree: {
    signatureVerify: {
      execute: async (signatureData) => {
        try {
          const executionDetails = await sdk.functions.createExecution(config.appWrite.cashfreeSignatureFunctionId, signatureData)
          return executionDetails.$id
        } catch (e) {
          crashlytics().recordError(e)
          throw new Error('CANNOT_GET_VERIFY_EXECUTION_ID')
        }
      },
      get: async (executionId) => {
        const responseWithStatus = await getCompletionStatus(config.appWrite.cashfreeSignatureFunctionId, executionId)
        if (responseWithStatus.status === 'completed') {
          const response = JSON.parse(responseWithStatus.stdout)
          if (response.status !== 'OK') {
            throw new Error('VERIFY_EXECUTION_FAILED')
          }
          return response.verified
        } else {
          throw new Error('CANNOT_GET_VERIFY_EXECUTION')
        }
      }
    },
    token: {
      execute: async (loanAppId, amount, env) => {
        try {
          const payload = JSON.stringify({
            loanAppId, amount, env
          })
          const executionDetails = await sdk.functions.createExecution(config.appWrite.cashFreeTokenFunctionId, payload)
          return executionDetails.$id
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_GET_CASHFREE_TOKEN_EXECUTION_ID')
        }
      },
      get: async (executionId) => {
        const responseWithStatus = await getCompletionStatus(config.appWrite.cashFreeTokenFunctionId, executionId)
        if (responseWithStatus.status === 'completed') {
          const response = JSON.parse(responseWithStatus.stdout)
          if (response.status !== 'OK') {
            throw new Error('CANNOT_GET_CASHFREE_TOKEN')
          }
          return response.cftoken
        } else {
          throw new Error('CANNOT_GET_CASHFREE_TOKEN')
        }
      }
    }
  },
  borrowingEntities: {
    get: async () => {
      try {
        const borrowingEntities = await sdk.database.listDocuments(config.appWrite.borrowingEntitiesCollectionId)
        return borrowingEntities.documents
      } catch (err) {
        crashlytics().log(err)
        throw new Error('CANNOT_GET_BORROWING_ENTITIES')
      }
    }
  },
  loanTypes: {
    getAll: async () => {
      try {
        const response = await sdk.database.listDocuments(config.appWrite.loanTypesCollectionId)
        return response.documents
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_LOAN_TYPES')
      }
    }
  },
  loanProducts: {
    getAll: {
      execute: async () => {
        try {
          const executionDetails = await sdk.functions.createExecution(config.appWrite.loanProductMetadataFunctionId)
          return executionDetails.$id
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_GET_LOAN_PRODUCTS_EXECUTION_ID')
        }
      },
      get: async (executionId) => {
        const responseWithStatus = await getCompletionStatus(config.appWrite.loanProductMetadataFunctionId, executionId)
        if (responseWithStatus.status === 'completed') {
          const allProducts = unpackData(responseWithStatus.stdout)
          return allProducts
        } else {
          throw new Error('CANNOT_GET_ALL_PRODUCTS')
        }
      }
    }
  },
  user: {
    get: async () => {
      try {
        const account = await sdk.account.get()
        return account
      } catch (e) {
        crashlytics().log(e)
        throw new Error('NO_LOGGEDIN_USER')
      }
    },
    updatePassword: async (password) => {
      try {
        await sdk.account.updatePassword(password)
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_SET_PASSWORD')
      }
    },
    updateAccountEmail: async (email) => {
      try {
        await sdk.account.updateEmail(email)
      } catch (e) {
        throw new Error('CANNOT_UPDATE_EMAIL')
      }
    },
    getJwtToken: async () => {
      try {
        const jwt = await sdk.account.createJWT()
        return jwt
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_CREATE_JWT')
      }
    }
  },
  auth: {
    login: async (email, password) => {
      try {
        await sdk.account.createSession(email, password)
        const user = await sdk.account.get()
        return user
      } catch (e) {
        crashlytics().log(e)
        console.log(e)
        throw new Error('CANNOT_CREATE_SESSION')
      }
    },
    register: async ({ email, password, fullName }) => {
      try {
        await sdk.account.create('unique()', email, password, fullName)
        await sdk.account.createSession(email, password)
        const user = await sdk.account.get()
        return user
      } catch (e) {
        if (e.message === 'Account already exists') {
          throw new Error('ACCOUNT_EXISTS')
        } else {
          crashlytics().log(e)
          throw new Error('CANNOT_REGISTER_USER')
        }
      }
    }
  },
  customer: {
    getExistingAddresses: async (customerId) => {
      try {
        const query = Query.equal('customerId', customerId)
        const response = await sdk.data.listDocuments(config.appWrite.addressCollectionId, query)
        return response.documents
      } catch (e) {
        console.log(e)
        throw new Error('CANNOT_GET_ADDRESSES_FOR_CUSTOMERID')
      }
    },
    getCustomerByUserId: async (userId) => {
      const { appWrite } = config
      const customerQuery = [
        Query.equal('userId', userId)
      ]
      try {
        const response = await sdk.database.listDocuments(appWrite.customersCollectionId, customerQuery)
        if (response.documents.length > 0) {
          const customerData = response.documents[0]
          // remove all default values
          Object.keys(customerData).forEach(key => {
            if (customerData[key] === 'np') {
              customerData[key] = undefined
            }
          })
          return customerData
        } else {
          return {}
        }
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_CUSTOMER_BY_USREID')
      }
    },
    get: async (id) => {
      const { appWrite } = config
      try {
        const customerData = await sdk.database.getDocument(appWrite.customersCollectionId, id)
        return customerData
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_CUSTOMER_BY_ID')
      }
    },
    create: async (customerData, userId) => {
      const { appWrite } = config
      customerData.createdOn = Date.now()
      customerData.updatedOn = Date.now()
      try {
        const data = await sdk.database.createDocument(
          appWrite.customersCollectionId,
          'unique()',
          customerData,
          [`user:${userId}`],
          [`user:${userId}`]
        )
        customerData.$id = data.$id
        return data
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_CREATE_NEW_CUSTOMER')
      }
    }
  },
  preferences: {
    get: async () => {
      try {
        const preferences = await sdk.account.getPrefs()
        return preferences
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_PREFERENCES')
      }
    },
    set: async (preferences) => {
      try {
        const prefs = await sdk.account.updatePrefs(preferences)
        return prefs
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_UPDATE_PREFERENCES')
      }
    }
  },
  loans: {
    getAllLoans: {
      execute: async (customerId) => {
        try {
          const payload = JSON.stringify(
            {
              data: {
                type: 'customerLoans',
                customerId
              }
            }
          )
          const executionDetails = await sdk.functions.createExecution(config.appWrite.lmsManagementFunctionId, payload)
          return executionDetails.$id
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_EXECUTE_GET_LOANS')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.lmsManagementFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            const allLoans = unpackData(responseWithStatus.stdout)
            return allLoans
          } else {
            throw new Error('CANNOT_GET_ALL_LOANS_FOR_CUSTOMER')
          }
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_GET_ALL_LOANS')
        }
      }
    }
  },
  loanApplication: {
    getAllLoanApplications: {
      execute: async (customerId) => {
        const payload = JSON.stringify({ customerId })
        try {
          const executionDetails = await sdk.functions.createExecution(config.appWrite.retrieveLoanApplicationFunctionId, payload)
          return executionDetails.$id
        } catch (e) {
          crashlytics().log(e)
          console.log(e)
          throw new Error('CANNOT_EXECUTE_LOAN_FORMDATA_FUNCION_ID')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.retrieveLoanApplicationFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            // For new user, next time login, it will not have any loan application, so can't unpackData
            if (!isEmpty(responseWithStatus.stdout)) {
              const allLoanApplications = unpackData(responseWithStatus.stdout)
              if (allLoanApplications.length > 0) {
                return allLoanApplications.map(la => JSON.parse(la))
              } else {
                return []
              }
            } else {
              return []
            }
          } else {
            throw new Error('CANNOT_COMPLETE_LOAN_FORM_DATA')
          }
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_EXECUTE_LOAN_FORM_DATA')
        }
      }
    },
    loanAgreement: {
      execute: async (loanApplicationId) => {
        try {
          const payload = JSON.stringify({ loanApplicationId })
          const executionDetails = await sdk.functions.createExecution(config.appWrite.loanAgreementFunctionId, payload)
          return executionDetails.$id
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_EXECUTE_LOAN_AGREEMENT_FUNCION_ID')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.loanAgreementFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            const { status, loanAgreementId } = JSON.parse(responseWithStatus.stdout)
            if (status === 'FAILED') {
              throw new Error('CANNOT_GET_LOANAGREEMET_ID')
            }
            return loanAgreementId
          } else {
            throw new Error('CANNOT_CALL_TO_GET_LOANAGREEMET_ID')
          }
        } catch (e) {
          crashlytics().log(e)
          throw new Error(e.message)
        }
      }
    },
    createLoanApplicationId: {
      execute: async () => {
        try {
          const executionDetails = await sdk.functions.createExecution(config.appWrite.loanApplicationIdGenerationFunctionId, config.LOAN_APPLICATION_TYPE)
          return executionDetails.$id
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_EXECUTE_LOAN_APP_ID')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.loanApplicationIdGenerationFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            const { loanApplicationId } = JSON.parse(responseWithStatus.stdout)
            return loanApplicationId.toString()
          } else {
            throw new Error('CANNOT_GET_LOAN_APPLICATION_ID')
          }
        } catch (e) {
          crashlytics().log(e)
          throw new Error('CANNOT_GET_LOAN_APP_ID')
        }
      }
    },
    get: async (loanApplicationId) => {
      const { appWrite } = config
      try {
        const loanApplication = await sdk.database.getDocument(appWrite.loanApplicationCollectionId, loanApplicationId)
        if (!isEmpty(loanApplication)) {
          Object.keys(loanApplication).forEach(key => {
            if (isInvalidValue(loanApplication[key])) {
              delete loanApplication[key]
            }
          })
          return loanApplication
        } else {
          return {}
        }
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_LOAN_APPLICATION')
      }
    },
    getAllLoanApplicationsOld: async (customerId) => {
      const { appWrite } = config
      const loanAppQuery = [
        Query.equal('customerId', customerId)
      ]
      try {
        const loanApplication = await sdk.database.listDocuments(appWrite.loanApplicationCollectionId, loanAppQuery)
        if (loanApplication.documents.length > 0) {
          loanApplication.documents.forEach(la => {
            Object.keys(la).forEach(key => {
              if (isInvalidValue(la[key])) {
                delete la[key]
              }
            })
          })
          return loanApplication.documents
        } else {
          return []
        }
      } catch (e) {
        crashlytics().log(e)
        throw new Error('CANNOT_GET_ALL_LOAN_APPLICATIONS')
      }
    },
    create: async (formData, userId) => {
      const { appWrite } = config
      if (isUndefined(formData.loanApplicationId) || formData.loanApplicationId.length === 0) {
        formData.loanApplicationId = 'dummy'
      }
      formData.createdOn = Date.now()
      formData.updatedOn = Date.now()
      const loanApplication = await sdk.database.createDocument(
        appWrite.loanApplicationCollectionId,
        'unique()',
        formData,
        [`user:${userId}`],
        [`user:${userId}`]
      )
      Object.keys(loanApplication).forEach(key => {
        if (isInvalidValue(loanApplication[key])) {
          delete loanApplication[key]
        }
      })
      return loanApplication
    },
    getAllOffers: {
      execute: async (loanApplicationId) => {
        try {
          const payload = JSON.stringify({ loanApplicationId })
          const executionDetails = await sdk.functions.createExecution(config.appWrite.retrieveLoanOffersFunctionId, payload)
          return executionDetails.$id
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_CREATE_LOAN_OFFER_EXECUTION')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.retrieveLoanOffersFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            const loanDeatails = JSON.parse(responseWithStatus.stdout)
            return loanDeatails
          } else {
            throw new Error('CANNOT_GET_LOAN_OFFER_DETAILS')
          }
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_GET_LOAN_OFFER_DETAILS')
        }
      }
    }
  },
  bankStatement: {
    validation: {
      execute: async ({ panData, bankStatementData }) => {
        try {
          const payload = JSON.stringify({ panData, bankStatementData })
          const executionDetails = await sdk.functions.createExecution(config.appWrite.bankStatementValidationFunctionId, payload)
          return executionDetails.$id
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_EXECUTE_BANK_STATEMENT_VALIDATION')
        }
      },
      get: async (executionId) => {
        try {
          const responseWithStatus = await getCompletionStatus(config.appWrite.bankStatementValidationFunctionId, executionId)
          if (responseWithStatus.status === 'completed') {
            const validationResult = JSON.parse(responseWithStatus.stdout)
            return validationResult
          } else {
            throw new Error('CANNOT_GET_BANK_VALIDATION')
          }
        } catch (err) {
          crashlytics().log(err)
          throw new Error('CANNOT_GET_BANK_VALIDATION_SERVER')
        }
      }
    },
    code: {
      get: async (bankCode) => {
        try {
          const { documents } = await sdk.database.listDocuments(config.appWrite.bankCodesCollectionId, [Query.equal('bankCode', bankCode)])
          const bankCodeDetails = documents[0]
          return bankCodeDetails?.bankId
        } catch (err) {
          crashlytics().log(err)
          return undefined
        }
      }
    }
  }
}
