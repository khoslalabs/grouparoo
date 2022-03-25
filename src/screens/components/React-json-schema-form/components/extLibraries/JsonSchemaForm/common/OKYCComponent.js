import React, { useState, useContext } from 'react'
import isEmpty from 'lodash.isempty'
import { useRequest } from 'ahooks'
import Toast from 'react-native-toast-message'
import { Button, CheckBox } from '@ui-kitten/components'
import { useSelector } from 'react-redux'
import { StyleSheet, View } from 'react-native'
import SpinnerButton from '../../../../../SpinnerButton'
import { useFormContext } from '..'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import MaskedInput from '../../textMask/text-input-mask'
import DataService from '../../../../services/DataService'
import ReactJsonSchemaUtil from '../../../../services/ReactJsonSchemaFormUtil'
import { LocalizationContext } from '../../../../translation/Translation'
import OtpComponent from '../../../../../OtpComponent'
import crashlytics from '@react-native-firebase/crashlytics'
import ErrorUtil from '../../../../../../Errors/ErrorUtil'

let finalAadharCard
const WAIT_RESEND_MS = 2 * 60 * 1000
const OTP_VALID_MS = 5 * 60 * 1000

const generateOtp = async (aadharNumber, panNumber) => {
  const resource = new ResourceFactoryConstants()
  try {
    const res = await DataService.postData(resource.constants.kyc.getUrlToGenerateOTP, {
      panId: panNumber,
      aadhaar_no: aadharNumber.split(' ').join('')

    })
    const data = res.data

    if (data.status === 'SUCCESS') {
      return true
    } else {
      throw new Error('CANNOT_GENERATE_AADHAR_OTP')
    }
  } catch (err) {
    if (err.message === 'CANNOT_GENERATE_AADHAR_OTP') {
      throw err
    } else {
      throw new Error('CANNOT_REACH_AADHAR_SERVER_FOR_OTP')
    }
  }
}

const verifyOtp = async (otp, shareCode, panData) => {
  const resource = new ResourceFactoryConstants()
  if (otp.length !== 6) {
    return
  }
  try {
    const res = await DataService.postData(resource.constants.kyc.getUrlToFetchKyc, {
      aadhaar_otp: otp,
      share_code: shareCode,
      panId: panData?.panNumber
    })
    const data = res.data
    if (data.status === 'SUCCESS') {
      const kycData = data.data
      let kycMatchData
      if (!isEmpty(kycData) && !isEmpty(panData)) {
        kycMatchData = await matchKycData(panData, kycData)
        kycData.kycMatchData = kycMatchData
      }
      return kycData
    } else {
      throw new Error('CANNOT_VALIDATE_AADHAR_OTP')
    }
  } catch (err) {
    // AADHAAR_AND_PAN_NOT_MATCHING
    const msg = err.message
    if (msg === 'CANNOT_VALIDATE_AADHAR_OTP' ||
      msg === 'NAME_MATCH_FAILED' ||
      msg === 'IDENTITY_MATCH_FAILED' || msg === 'CAN_NOT_REACH__AADHAR_PAN_MATCH_SERVER'
    ) {
      throw err
    } else if (err.name === 'AADHAAR_AND_PAN_NOT_MATCHING') {
      throw err
    } else {
      throw new Error('CANNOT_REACH_AADHAR_SERVER_FOR_OTP_VERIFY')
    }
  }
}

const matchKycData = async (panData, kycData) => {
  const resource = new ResourceFactoryConstants()
  try {
    const res = await DataService.postData(resource.constants.kyc.getUrlForIdMatch, {
      panData,
      kycData
    })
    if (res.data?.status === 'SUCCESS') {
      const matchData = res.data?.data
      // Backend api is doing the comparision
      // if (!matchData.dobMatch) {
      //   throw new Error('DOB_MATCH_FAILED')
      // }
      // if (matchData.matchRatio < 80) {
      //   throw new Error('NAME_MATCH_FAILED')
      // }
      return matchData
    } else {
      throw new Error('AADHAAR_AND_PAN_NOT_MATCHING', res.data.message)
    }
  } catch (e) {
    throw new Error('CAN_NOT_REACH__AADHAR_PAN_MATCH_SERVER')
  }
}

const OKYCComponent = (props) => {
  const { onOtpSuccess } = props
  const { theme } = useFormContext()
  const { translations } = useContext(LocalizationContext)
  const panData = useSelector((state) => state.formDetails.panData)
  const [isAadharValid, setIsAadharValid] = useState(true)
  const [shareCode, setShareCode] = useState()
  // const [isSubmitted, setIsSubmitted] = useState(false)
  const [isShareCodeValid, setIsShareCodeValid] = useState(true)
  const [otpGenerated, setOtpGenerated] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [aadharCard, setAdharCard] = useState('')
  const [aadharConsent, setAadharConsent] = useState(true)
  const [otp, setOtp] = useState('')

  const useOtpVerfy = useRequest(verifyOtp, {
    manual: true,
    onError: (error) => {
      crashlytics().log(ErrorUtil.createError(error, error.message, error.message, undefined, 'useOtpVerify', 'OKYCComponent.js'))
      if (error.message === 'CANNOT_REACH_AADHAR_SERVER_FOR_OTP_VERIFY') {
        throw error
      } else if (error.message === 'AADHAAR_AND_PAN_NOT_MATCHING') {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['aadhar.otpVerify.title'],
            description: translations['aadhar.pan.match.fail']
          }
        })
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['aadhar.otpVerify.title'],
            description: translations['aadhar.otpVerify.failed']
          }
        })
      }
    },
    onSuccess: (result) => {
      setOtpVerified(true)
      Toast.show({
        type: 'success',
        position: 'bottom',
        visibilityTime: 2000,
        props: {
          title: translations['aadhar.otpVerify.title'],
          description: translations['aadhar.otpVerify.success']
        }
      })
      if (onOtpSuccess) {
        onOtpSuccess(result)
      }
    }
  })
  const useGenerateOtp = useRequest(generateOtp, {
    manual: true,
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        position: 'bottom',
        visibilityTime: 2000,
        props: {
          title: translations['aadhar.otp.title'],
          description: translations['aadhar.otp.success']
        }
      })
      setOtpGenerated(true)
    },
    onError: (error) => {
      if (error.message === 'CANNOT_REACH_AADHAR_SERVER_FOR_OTP') {
        throw error
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['aadhar.otp.title'],
            description: translations['aadhar.otp.failed']
          }
        })
      }
    }
  })
  const onSendOtpHandler = () => {
    let hasError = false
    if (isEmpty(aadharCard) || (aadharCard && aadharCard.length !== 14)) {
      setIsAadharValid(false)
      hasError = true
    } else {
      setIsAadharValid(true)
    }
    if (!aadharConsent) {
      hasError = true
    }
    if (!hasError) {
      useGenerateOtp.run(finalAadharCard, panData?.panNumber)
    }
  }

  const onBlurHandler = () => {
    finalAadharCard = aadharCard
    if (isEmpty(aadharCard) || (aadharCard && aadharCard.length !== 14)) {
      setIsAadharValid(false)
    }
    setAdharCard(ReactJsonSchemaUtil.getMaskedAadhar(aadharCard))
  }

  const otpVerificationHandler = () => {
    useOtpVerfy.run(otp, shareCode, panData)
  }
  const validateShareCode = () => {
    if (shareCode.toString().length !== 4) {
      setIsShareCodeValid(false)
    }
  }
  return (
    <>
      {!otpGenerated && !otpVerified && (
        <View>
          <View style={styles.rowMargin}>
            <MaskedInput
              label={translations['aadhar.enterAdhaarNumber']}
              type='custom'
              options={{
                mask: 'SSSS SSSS 9999'
              }}
              includeRawValueInChangeText
              placeholder='XXXX XXXX 1234'
              keyboardType='numeric'
              value={aadharCard}
              onChangeText={(newText, rawText) => setAdharCard(newText)}
              onBlur={onBlurHandler}
              onFocus={() => setAdharCard(finalAadharCard)}
              selectionColor={theme.highlightColor}
              placeholderTextColor={theme.placeholderTextColor}
              status={!isAadharValid && 'danger'}

            />
          </View>
          <View style={styles.rowMargin}>
            <CheckBox
              checked={aadharConsent}
              status={aadharConsent ? 'basic' : 'danger'}
              onChange={(nextChecked) => setAadharConsent(nextChecked)}
            >
              {translations['aadhar.consent']}
            </CheckBox>
          </View>
          <View style={styles.rowMargin}>
            <SpinnerButton
              loading={useGenerateOtp.loading}
              disabled={useGenerateOtp.loading || !aadharConsent}
              style={styles.button}
              appearance='outline'
              onPress={onSendOtpHandler}
              status='primary'
            >
              {translations['aadhar.generateOtp']}
            </SpinnerButton>
          </View>
        </View>
      )}
      {otpGenerated && !otpVerified && (
        <View>
          <View style={styles.rowMargin}>
            <OtpComponent
              primaryPhone={translations['adhhar.registeredPhone']}
              onResendOtp={onSendOtpHandler}
              loading={useOtpVerfy.loading}
              onValidateOtp={setOtp}
              otpValid={otpVerified}
              numSecondsWaitForResend={WAIT_RESEND_MS}
              otpValidWindow={OTP_VALID_MS}
              size='small'
            />
          </View>
          <View style={styles.rowMargin}>
            <MaskedInput
              type='custom'
              options={{
                mask: '9999'
              }}
              label='Enter Your Share Code (Please enter any 4 digits)*'
              includeRawValueInChangeText
              placeholder='1234'
              keyboardType='numeric'
              value={shareCode}
              onChangeText={(text) => setShareCode(text)}
              onBlur={validateShareCode}
              selectionColor={theme.highlightColor}
              placeholderTextColor={theme.placeholderTextColor}
              status={!isShareCodeValid ? 'danger' : 'basic'}
            />
          </View>
          <View style={styles.rowMargin}>
            <Button
              style={styles.button}
              appearance='outline'
              onPress={otpVerificationHandler}
            >
              {translations['aadhar.verify']}
            </Button>
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  aadharContainer: {
    marginVertical: 4
  },
  image: {
    height: 30,
    width: 70,
    resizeMode: 'stretch'
  },
  captchaRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    alignItems: 'center'
  },
  captchaInput: {
    flex: 0.7
  },
  capcha: {
    flex: 0.3,
    flexDirection: 'row',
    marginTop: 24,
    marginLeft: 4
  },
  rowMargin: {
    marginVertical: 8
  }
})
export default OKYCComponent
