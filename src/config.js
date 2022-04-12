import { PERMISSIONS, RESULTS } from 'react-native-permissions'

export const config = {
  appName: 'Novo Loans',
  entityType: 'retail',
  termsUrl: 'https://www.novopay.in/business-loan/terms-and-conditions',
  ppUrl: 'https://www.novopay.in/business-loan/privacy-policy',
  appWrite: {
    url: 'https://dev-appwrite.novopay.in/v1',
    projectId: '61fc67b0347f85b8f5b1',
    customersCollectionId: '61fc6872e7eab316406d',
    loanApplicationCollectionId: '61fc9d1ab041f556aa0c',
    loanApplicationIdGenerationFunctionId: '6201dd75d89e37c8bcf5', // - Create a loan Application Id
    lmsManagementFunctionId: '6201e05e6c0fb1554da9', // Function for getting all the existing loans
    loanProductCollectionId: '6200fbbf2bd8d3306064', // Use this later
    loanProductMetadataFunctionId: '6201da9175a47a240fc1', // Loan products metadata
    loanTypesCollectionId: '62009a62478bcc3611a5',
    retrieveLoanOffersFunctionId: '624aee82597da830b063',
    borrowingEntitiesCollectionId: '620274f11aaf04f08370',
    retrieveLoanApplicationFunctionId: '61ff77ef81669037d64a',
    addressCollectionId: '61fc93bfae7d80de1ae2',
    cashFreeTokenFunctionId: '621f9d2f51d07eca5f6b',
    appStateEventsCollectionId: '6223228537efd99c9714',
    cashfreeSignatureFunctionId: '6225db949e947cf7e996',
    loanAgreementFunctionId: '622748ba485820ecd386',
    bankStatementValidationFunctionId: '623b002f3c9d6860434b',
    bankCodesCollectionId: '6233596db7c5e0e6e8b7'
  },
  DEFAULT_PASSWORD: 'welcome',
  otp: {
    sendOtp: 'https://dev-codeapp.novopay.in/sendOtp',
    validateOtp: 'https://dev-codeapp.novopay.in/validateOtp'
  },
  PAYMENT_ENV: 'Test',
  CASHFREE_APP_ID: '10135219c0acc6b63005cb8cf8253101',
  CASHFREE_STATUSES: {
    SUCCESS: 'SUCCESS',
    FLAGGED: 'FLAGGED',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    INCOMPLETE: 'INCOMPLETE',
    USER_DROPPED: 'USER_DROPPED',
    VOID: 'VOID'
  },
  permissions: {
    permissionTypes: [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.READ_SMS
    ],
    // This is for android only and not IOS. Need to enhance app for IOS later
    acceptedResults: [
      RESULTS.LIMITED,
      RESULTS.GRANTED
    ]
  },
  loanApplicationWebView: 'https://dev-codeapp.novopay.in/?formName=onboarding_test&stepSchemaName=onboarding_test_mob&isHeaderRequired=false',
  // loanApplicationWebView: 'https://92da-111-125-218-187.ngrok.io/?formName=onboarding_test&stepSchemaName=onboarding_test_mob&isHeaderRequired=false'
  LOAN_APPLICATION_TYPE: 'loanapp',
  FINBOX_CLIENT_API_KEY: 'HKKK42YfZh5tCkD0tZ0LH631mT0lYkj799StDtfK',
  LOAN_DISBURSED_STATUS: 'DISBURSED',
  LOAN_CLOSED_STATUS: 'CLOSED',
  REPAYMENT_PENDIND_STATUS: 'PEN',
  REPAYMENT_PAID_STATUS: 'PAID',
  DEFAULT_PRODUCT_TYPE: 'termloan',
  LOAN_DATE_FORMAT: 'YYYY-MM-DD',
  APP_DATE_FORMAT: 'DD-MMM-YYYY',
  // Repayment
  REPAYMENT_AMORTIZED: 'amortized',
  REPAYMNET_EQUATED: 'equated',
  REPAYMENT_UPFRONT_EQUATED: 'upfrontequated',
  REPAYMENT_BULLET_END: 'bulletend',
  REPAYMENT_BULLET_BEGINNING: 'bulletbeginning',
  REPAYMENT_UPFRONT_AMORTIZED: 'upfrontamortized',

  REPAYMENT_DATE_FORMAT: 'DD-MMM-YY',
  TERM_LOAN_AMOUNT_STEP: 25000,
  TERM_LOAN_MIN_AMOUNT: 50000,
  TERM_LOAN_MAX_AMOUNT: 300000,
  INSTALLMENT_TYPE_BULLET: 'BULLET',
  INSTALLMENT_TYPE_EQUATED: 'EQUATED',
  INSTALLMENT_TYPE_EQUAL_PRINCIPAL: 'EQUAL_PRINCIPAL',
  FREQ_MONTHLY: 'm',
  FREQ_DAILY: 'd',
  FREQ_WEEKLY: 'w',
  FREQ_YEARLY: 'y',
  FREQ_QUARTERLY: 'q',
  EVENT_ACTIVE: 'EVENT_ACTIVE',
  EVENT_FORM_SUBMITTED: 'EVENT_FORM_SUBMITTED',
  EVENT_DROPOFF: 'EVENT_DROPOFF',
  EVENT_PAYMENT_DROP: 'EVENT_PAYMENT_DROP',
  EVENT_PAYMENT_SUCCESS: 'EVENT_PAYMENT_SUCCESS',
  EVENT_PAYMENT_FAILED: 'EVENT_PAYMENT_FAILED',
  APP_STAGE_CPV_COMPLETE: 'cpvCompleted',
  APP_STAGE_CPV_INITIATED: 'cpvInitiated',
  LOAN_APP_PROGRESS_COMPLETE: 'COMPLETE',
  LOAN_APP_PROGRESS_INCOMPLETE: 'INCOMPLETE',

  // if false, rest api call will be done otherwise app write function will be called
  APPWRITE_FUNCTION_CALL: false
}
