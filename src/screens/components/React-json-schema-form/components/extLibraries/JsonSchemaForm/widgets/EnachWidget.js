import { Button, Text } from '@ui-kitten/components'
import React, { useContext, useEffect, useState } from 'react'
import DataService from '../../../../services/DataService'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import { Linking, View, StyleSheet, Alert, Image } from 'react-native'
import isEmpty from 'lodash.isempty'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../../../../../LoadingSpinner'
import Toast from 'react-native-toast-message'
import { LocalizationContext } from '../../../../translation/Translation'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'
import { useRequest } from 'ahooks'
import crashlytics from '@react-native-firebase/crashlytics'
import ErrorUtil from '../../../../../../Errors/ErrorUtil'
import dayjs from 'dayjs'
import FormSuccess from '../../../Forms/FormSuccess'
import { config } from '../../../../../../../config'
import {
  heightPercentageToDP,
  widthPercentageToDP
} from 'react-native-responsive-screen'
import apiService from '../../../../../../../apiService'
const resourceFactoryConstants = new ResourceFactoryConstants()
const dayjsMapper = {
  [config.FREQ_MONTHLY]: 'month',
  [config.FREQ_DAILY]: 'day',
  [config.FREQ_WEEKLY]: 'week',
  [config.FREQ_YEARLY]: 'year',
  [config.FREQ_HALFYEARLY]: 'year'
}
const getRandomId = () => String(Math.floor(100000 + Math.random() * 900000))

const createPlan = async (planObject) => {
  const res = await DataService.postData(
    resourceFactoryConstants.constants.enach.createPlan,
    planObject
  )
  const data = res.data
  console.log('createPlan data', data)
  if (data.status === 'SUCCESS') {
    return true
  } else {
    throw new Error('PLAN_CREATION_FAILED')
  }
}

const createSubscription = async (subscriptionObj) => {
  const res = await DataService.postData(
    resourceFactoryConstants.constants.enach.createSeamlessSubscription,
    subscriptionObj
  )
  const data = res.data
  console.log('createSubscription data', data)

  if (data.status === 'SUCCESS') {
    return data.authLink
  } else {
    throw new Error('SUBSCRIPTION_CREATION_FAILED')
  }
}
const getBankCodeFromBankName = async (bankCode) => {
  const code = await apiService.appApi.bankStatement.code.get(
    bankCode.toUpperCase()
  )
  return code
}

const EnachWidget = (props) => {
  const jsonSchema = useSelector((state) => state?.formDetails?.schema)
  const formName = jsonSchema?.formName
  const [isRetryEnabled, setIsRetryEnabled] = useState(false)
  const [authLink, setAuthLink] = useState()
  const { translations } = useContext(LocalizationContext)
  const [isPlanCreated, setIsPlanCreated] = useState(false)
  const [bankCode, setBankCode] = useState()
  const [isSubscriptionCreated, setIsSubscriptionCreated] = useState(
    !!props.value
  )
  const [appUrl, setAppUrl] = useState(null)
  const [planId, setPlanId] = useState(getRandomId())
  // cont bankStatementData = useSelector(
  //   (state) => state.formDetails.bankStatementData
  // )

  const bankStatementData=bankStatementData||{
                "statement": {
                    "bank_name": "kotak",
                    "statement_id": "dc61686d-aa8f-41ae-8aaf-0dc15f2d65bf",
                    "entity_id": "18f28fee-2e27-4ca0-9c0d-0b0c4486d027",
                    "identity": {
                        "account_number": "3512392038",
                        "name": "VISHAL SHAW",
                        "address": "Vishal Shaw 3-1, College Row Raja Ram Mohan Sarani Near Collage Street Crosine Kolkata 700009 West Bengal India",
                        "account_category": null,
                        "credit_limit": 0,
                        "account_id": "4acbce68-2fbc-4a1b-9143-38c919dbe243"
                    },
                    "date_range": {
                        "from_date": "2021-05-01",
                        "to_date": "2021-05-31"
                    },
                    "is_fraud": false,
                    "fraud_type": null,
                    "status": 1
                },
                "transaction_details": {
                    "accounts": [
                        {
                            "account_number": "3512392038",
                            "bank": "kotak",
                            "account_id": "4acbce68-2fbc-4a1b-9143-38c919dbe243",
                            "micr": "700485021",
                            "account_category": null,
                            "statements": [
                                "dc61686d-aa8f-41ae-8aaf-0dc15f2d65bf"
                            ],
                            "ifsc": "KKBK0006584",
                            "months": [
                                "2021-05"
                            ]
                        }
                    ]
                }
            }
    
    
  // const accountType = useSelector(
  //   (state) => state?.formDetails?.formData?.bankAccountType?.accountType
  // )

  const accountType = accountType||"Savings"
  let { loanOffer, email, primaryPhone } = useSelector(
    (state) => state.formDetails.formData
  )
  loanOffer=loanOffer ||{
    "productId": "smel005",
    "offerId": "103",
    "finalLoanAmount": 150000,
    "finalLoanTenure": 3,
    "finalInstallmentFrequency": "m",
    "finalEmiAmount": 52182,
    "unit": "m"
}
  

  console.log( loanOffer, email, primaryPhone,accountType,bankStatementData);
  const bankName = bankStatementData?.statement?.bank_name
  const accountHolderName = bankStatementData?.statement?.identity?.name
  const accountNo = bankStatementData?.statement?.identity?.account_number
  useEffect(async () => {
    if (!isEmpty(bankName) && isEmpty(props.value)) {
      const tempBankCode = await getBankCodeFromBankName(
        bankName.toUpperCase()
      )
      setBankCode(tempBankCode)
    }
  }, [bankName])


  const planObject = {
    planId: planId,
    planName: `${formName}_${getRandomId()}`,
    type: 'PERIODIC',
    amount: loanOffer.finalEmiAmount ,// Need to set it from its loan Offer Data, emi amount
    intervalType: dayjsMapper[loanOffer.finalInstallmentFrequency],
    intervals: loanOffer.finalLoanTenure
  }

  const expiresOn = `${dayjs()
    .add(30 * (planObject.intervals + 2), 'day')
    .format('YYYY-MM-DD HH:mm:ss')}`

  const expiresOnForUi = `${dayjs()
    .add(30 * planObject.intervals, 'day')
    .format('DD-MMM-YYYY')}`

  const calFirstChargeDate = () => {
    const now = dayjs()
    const date = now.format('D') > 20
      ? dayjs(`${now.format('YYYY')}-${Number(now.format('MM')) + 2}-4`)
      : dayjs(`${now.format('YYYY')}-${Number(now.format('MM')) + 1}-4`)
    return date.format('YYYY-MM-DD')
  }

  const subscriptionObject = {
    // cashfree
    subscriptionId: `${formName}_${getRandomId()}`,
    planId: planId,
    customerEmail: email,
    customerPhone: primaryPhone,
    firstChargeDate: calFirstChargeDate(),
    expiresOn: expiresOn,
    returnUrl: appUrl,
    paymentOption: 'emandate',
    emandate_accountHolder: accountHolderName,
    emandate_accountNumber: accountNo,
    emandate_bankId: bankCode,
    emandate_authMode: 'netbanking',
    emandate_accountType: accountType?.toUpperCase()
  }

  // Automatically Starts creating Plan
  useEffect(() => {
    if (!props.value) {
      useCreatePlan.run(planObject)
    }
  }, [])

  useEffect(async () => {
    const initialUrl = await Linking.getInitialURL()
    setAppUrl(initialUrl || 'novopay://com.novoloan.customerapp/open')
  }, [])

  const handleUrl = (event) => {
    let errMsg
    let temp = false
    let subRefId
    const returnUrl = event.url
    const queryParamObject = ReactJsonSchemaUtil.getQueryParams(returnUrl)
    for (const key in queryParamObject) {
      if (key === 'cf_status' && queryParamObject[key] !== 'ERROR') {
        setIsSubscriptionCreated(true)
        temp = true
      }
      if (key === 'cf_message') {
        errMsg = queryParamObject[key]
      }
      if (key === 'cf_subReferenceId') {
        subRefId = queryParamObject[key]
      }
    }
    // TODO: Need to Fix, it is getting cath by other handler too
    if (!temp && errMsg) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        props: {
          title: translations['enach.title'],
          description: errMsg
        }
      })
    }
    if (subRefId) {
      props.onChange(subRefId)
    }
  }

  const useCreatePlan = useRequest(createPlan, {
    manual: true,
    onSuccess: () => {
      setIsRetryEnabled(false)
      setIsPlanCreated(true)
      useCreateSubscription.run(subscriptionObject)
    },
    onError: (error) => {
      setIsRetryEnabled(true)
      throw error
    }
  })

  const useCreateSubscription = useRequest(createSubscription, {
    manual: true,
    onSuccess: (authLink) => {
      setAuthLink(authLink)
    },
    onError: (error) => {
      throw error
    }
  })

  const openLink = async (eNachUrl) => {
    const supported = await Linking.canOpenURL(eNachUrl)
    if (supported) {
      Linking.addEventListener('url', handleUrl)
      await Linking.openURL(eNachUrl)
    } else {
      crashlytics().log(
        ErrorUtil.createLog(
          'Can not open this url',
          eNachUrl,
          'openLink',
          'EnachWidget.js'
        )
      )
    }
  }

  const eMandateHandler = () => {
    if (isEmpty(authLink)) return
    Alert.alert(translations['enach.title'], translations['enach.redirect'], [
      {
        text: translations['text.okay'],
        onPress: () => {
          openLink(authLink)
        }
      }
    ])
  }
  const retryHandler = () => {
    const id = getRandomId()
    setPlanId(id)
    useCreatePlan.run({ ...planObject, planId: id })
  }
  return (
    <>
      <LoadingSpinner
        visible={useCreatePlan.loading || useCreateSubscription.loading}
      />
      {isRetryEnabled && (
        <Button appearance='outline' onPress={retryHandler}>
          Retry
        </Button>
      )}
      {!isSubscriptionCreated && isPlanCreated && !isRetryEnabled && (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../../../../../assets/images/enach-icon.png')}
              style={styles.image}
              resizeMode='center'
            />
          </View>
          <View style={styles.card}>
            <View style={styles.rowDesign}>
              <View>
                <Text category='p1' appearance='hint'>
                  {' '}
                  {translations['enach.planType']}
                </Text>
              </View>
              <View>
                <Text
                  style={styles.valueText}
                  category='s1'
                  appearance='default'
                >
                  {planObject.type === 'PERIODIC' ? 'Periodic' : 'No Data'}
                </Text>
              </View>
            </View>
            <View style={styles.line} />
            <View style={styles.rowDesign}>
              <View>
                <Text category='p1' appearance='hint'>
                  {translations['enach.intervalType']}
                </Text>
              </View>
              <View>
                <Text
                  style={styles.valueText}
                  category='s1'
                  appearance='default'
                >
                  {planObject.intervalType === 'month' ? 'Monthly' : 'No Data'}
                </Text>
              </View>
            </View>
            <View style={styles.line} />
            <View style={styles.rowDesign}>
              <View>
                <Text category='p1' appearance='hint'>
                  {translations['enach.amount']}
                </Text>
              </View>
              <View>
                <Text
                  style={styles.valueText}
                  category='s1'
                  appearance='default'
                >
                  ₹ {planObject.amount}
                </Text>
              </View>
            </View>
            <View style={styles.line} />
            <View style={styles.rowDesign}>
              <View>
                <Text category='p1' appearance='hint'>
                  {translations['enach.noOfIntervals']}
                </Text>
              </View>
              <View>
                <Text
                  style={styles.valueText}
                  category='s1'
                  appearance='default'
                >
                  {planObject.intervals}
                </Text>
              </View>
            </View>
            <View style={styles.line} />
            <View style={styles.rowDesign}>
              <View>
                <Text category='p1' appearance='hint'>
                  {translations['enach.expiresOn']}
                </Text>
              </View>
              <View>
                <Text
                  style={styles.valueText}
                  category='s1'
                  appearance='default'
                >
                  {expiresOnForUi}
                </Text>
              </View>
            </View>
            <View style={styles.rowDesignBtn}>
              <Button appearance='outline' onPress={eMandateHandler}>
                {translations['enach.start']}
              </Button>
            </View>
            <Text appearance='hint' category='label'>
              {translations['enach.details.hint']}
            </Text>
          </View>
        </View>
      )}
      {isSubscriptionCreated && (
        <FormSuccess
          description={translations['enach.subscription.done']}
          isButtonVisible={false}
        />
      )}
    </>
  )
}
const styles = StyleSheet.create({
  valueText: {
    fontWeight: 'bold'
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: heightPercentageToDP('75%')
  },
  card: {
    width: widthPercentageToDP('85%'),
    marginBottom: 30
  },
  image: {
    width: widthPercentageToDP('45%'),
    height: widthPercentageToDP('45%')
  },
  line: {
    marginTop: 10,
    borderBottomColor: '#F0F0FF',
    borderBottomWidth: 1
  },
  rowDesign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  rowDesignBtn: {
    marginTop: 10
  }
})
export default EnachWidget
