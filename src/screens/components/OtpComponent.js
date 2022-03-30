import React, { useContext, useState } from 'react'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Text, StyleService, useStyleSheet } from '@ui-kitten/components'
import TimeoutComponent from './TimoutComponent'
import styleConstants from '../styleConstants'
import { LocalizationContext } from '../../components/Translation'
import LoadingSpinner from '../components/LoadingSpinner'
import ResetButton from './ResetButton'

const OtpComponent = ({
  primaryPhone,
  onResendOtp,
  loading,
  onValidateOtp,
  otpValid,
  numSecondsWaitForResend,
  otpValidWindow,
  size = 'normal'
}) => {
  const { translations } = useContext(LocalizationContext)
  const styles = useStyleSheet(themedStyles)
  const [isValidating, setIsValidating] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  // Run the fetch OTP on mount
  // Manage number of retries
  // Managing countdown of otp validity - 5 mons validity

  // Manage enable resend otp after NUM_SEC_WAIT timeout

  const resendOtp = () => {
    setStartTime(Date.now())
    onResendOtp()
  }
  const verifyCode = async code => {
    setIsValidating(true)
    await onValidateOtp(code)
    setIsValidating(false)
  }
  return (
    <KeyboardAwareScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={size === 'small' ? styles.otpContainerSmall : styles.otpContainer}>
        <Text style={styles.content} category='p1'>
          {translations.formatString(translations['otp.sentOtpToMobile'], {
            primaryPhone
          })}
        </Text>
        <OTPInputView
          style={styles.otp}
          pinCount={6}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={verifyCode}
        />
        <View style={size === 'small' ? styles.actionRowSmall : styles.actionRow}>
          <TimeoutComponent
            validWindow={otpValidWindow}
            startTime={startTime}
          />
          <View>
            <ResetButton
              startTime={startTime}
              sleepTime={numSecondsWaitForResend}
              loading={loading}
              resendOtp={resendOtp}
            />
          </View>
        </View>
        {otpValid === 'invalid' && (
          <View>
            <Text
              category='s1'
              status='danger'
            >
              {translations['otp.invalidOtp']}
            </Text>
          </View>
        )}
        {
          isValidating && <LoadingSpinner />
        }
      </View>
    </KeyboardAwareScrollView>

  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1
  },
  actionRow: {
    paddingVertical: 32,
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionRowSmall: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    marginHorizontal: 16,
    borderRadius: 16
  },
  content: {
    ...styleConstants.content
  },
  otpContainer: {
    marginVertical: 100,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  otpContainerSmall: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  otp: {
    height: 100,
    width: '100%'
  },
  borderStyleBase: {
    width: 30,
    height: 45
  },

  borderStyleHighLighted: {
    borderColor: 'color-primary-500'
  },
  underlineStyleBase: {
    width: 45,
    height: 45,
    borderWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'border-basic-color-5',
    color: 'color-primary-500',
    fontSize: 16,
    backgroundColor: '#FFF'
  },
  underlineStyleHighLighted: {
    borderColor: 'color-primary-500'
  }
})

export default OtpComponent
