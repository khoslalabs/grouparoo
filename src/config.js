import { PERMISSIONS, RESULTS } from "react-native-permissions";
import ResourceFactoryConstants from "./screens/components/React-json-schema-form/services/ResourceFactoryConstants";
const resourse = new ResourceFactoryConstants();
export const config = {
  appName: "Novo Loans",
  entityType: "retail",
  termsUrl: "https://www.novopay.in/business-loan/terms-and-conditions",
  ppUrl: "https://www.novopay.in/business-loan/privacy-policy",
  appWrite: {
    url: "https://lending-prod-appwrite.novopay.in/v1",
    projectId: "629f37455c061d9bf6e6",
    customersCollectionId: "6256b086d138efa50aa8",
    loanApplicationCollectionId: "6256bbe7ec8c2f657734",
    loanApplicationIdGenerationFunctionId: "Not in PROD",
    lmsManagementFunctionId: "Not in PROD",
    loanProductCollectionId: "1649852201794",
    loanProductMetadataFunctionId: "Not in PROD",
    loanTypesCollectionId: "1649852181645",
    retrieveLoanOffersFunctionId: " Not in PROD",
    borrowingEntitiesCollectionId: "1649852209922",
    retrieveLoanApplicationFunctionId: "Not in PROD",
    addressCollectionId: "6256b66ad749ae51e1e3",
    cashFreeTokenFunctionId: "Not in PROD",
    appStateEventsCollectionId: "6223228537efd99c9714",
    cashfreeSignatureFunctionId: "Not in PROD",
    loanAgreementFunctionId: "Not in PROD",
    bankStatementValidationFunctionId: "Not in PROD",
    bankCodesCollectionId: "1649852246211",
  },

  DEFAULT_PASSWORD: "welcome",
  otp: {
    sendOtp: resourse.constants.otp.generateOTP,
    validateOtp: resourse.constants.otp.validateOTP,
  },

  PAYMENT_ENV: "Test",
  CASHFREE_APP_ID: "10135219c0acc6b63005cb8cf8253101",
  CASHFREE_STATUSES: {
    SUCCESS: "SUCCESS",
    FLAGGED: "FLAGGED",
    PENDING: "PENDING",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
    INCOMPLETE: "INCOMPLETE",
    USER_DROPPED: "USER_DROPPED",
    VOID: "VOID",
  },

  permissions: {
    permissionTypes: [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.READ_SMS,
    ],

    // This is for android only and not IOS. Need to enhance app for IOS later

    acceptedResults: [RESULTS.LIMITED, RESULTS.GRANTED],
  },

  loanApplicationWebView:
    "https://prod-codeapp.novopay.in/?formName=onboarding_test&stepSchemaName=onboarding_test_mob&isHeaderRequired=false",

  // loanApplicationWebView: 'https://92da-111-125-218-187.ngrok.io/?formName=onboarding_test&stepSchemaName=onboarding_test_mob&isHeaderRequired=false'

  LOAN_APPLICATION_TYPE: "loanapp",

  FINBOX_CLIENT_API_KEY: "HKKK42YfZh5tCkD0tZ0LH631mT0lYkj799StDtfK",

  LOAN_DISBURSED_STATUS: "DISBURSED",

  LOAN_CLOSED_STATUS: "CLOSED",

  REPAYMENT_PENDIND_STATUS: "PEN",

  REPAYMENT_PAID_STATUS: "PAID",

  DEFAULT_PRODUCT_TYPE: "termloan",

  LOAN_DATE_FORMAT: "YYYY-MM-DD",

  APP_DATE_FORMAT: "DD-MMM-YYYY",

  // Repayment

  REPAYMENT_AMORTIZED: "amortized",

  REPAYMNET_EQUATED: "equated",

  REPAYMENT_UPFRONT_EQUATED: "upfrontequated",

  REPAYMENT_BULLET_END: "bulletend",

  REPAYMENT_BULLET_BEGINNING: "bulletbeginning",

  REPAYMENT_UPFRONT_AMORTIZED: "upfrontamortized",

  REPAYMENT_DATE_FORMAT: "DD-MMM-YY",

  TERM_LOAN_AMOUNT_STEP: 25000,

  TERM_LOAN_MIN_AMOUNT: 50000,

  TERM_LOAN_MAX_AMOUNT: 300000,

  INSTALLMENT_TYPE_BULLET: "BULLET",

  INSTALLMENT_TYPE_EQUATED: "EQUATED",

  INSTALLMENT_TYPE_EQUAL_PRINCIPAL: "EQUAL_PRINCIPAL",

  FREQ_MONTHLY: "m",

  FREQ_DAILY: "d",

  FREQ_WEEKLY: "w",

  FREQ_YEARLY: "y",

  FREQ_QUARTERLY: "q",

  EVENT_ACTIVE: "EVENT_ACTIVE",

  EVENT_FORM_SUBMITTED: "EVENT_FORM_SUBMITTED",

  EVENT_DROPOFF: "EVENT_DROPOFF",

  EVENT_PAYMENT_DROP: "EVENT_PAYMENT_DROP",

  EVENT_PAYMENT_SUCCESS: "EVENT_PAYMENT_SUCCESS",

  EVENT_PAYMENT_FAILED: "EVENT_PAYMENT_FAILED",

  APP_STAGE_CPV_COMPLETE: "cpvCompleted",

  APP_STAGE_CPV_INITIATED: "cpvInitiated",

  LOAN_APP_PROGRESS_COMPLETE: "COMPLETE",

  LOAN_APP_PROGRESS_INCOMPLETE: "INCOMPLETE",

  // if false, rest api call will be done otherwise app write function will be called

  APPWRITE_FUNCTION_CALL: false,
};
