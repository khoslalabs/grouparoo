import React, { useContext, useEffect, useState } from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import { Button, Input, Text, StyleService, useStyleSheet, Icon, useTheme } from '@ui-kitten/components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { LocalizationContext } from '../../components/Translation'
import styleConstants from '../styleConstants'
import ScreenTitle from '../components/ScreenTitle'
import { FormIcons } from '../components/ThemedIcons'
import SpinnerButton from '../components/SpinnerButton'
import apiService from '../../apiService'
import isEmpty from 'lodash.isempty'
import { useRequest } from 'ahooks'
import { mask, unMask } from 'react-native-mask-text'
import otpService from '../../apiService/otpService'
import OtpComponent from '../components/OtpComponent'
import Toast from 'react-native-toast-message'

let isResetButtonPressed = false
const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
}
const validateEmailExistsOrNot = async (email) => {
  const customerData = await apiService.appApi.customer.getCustomerByEmailId(email)
  return customerData
}
export default ({ navigation, route }) => {
  useEffect(() => { isResetButtonPressed = false }, []) // only once if component loads
  const [userPassword, setUserPassword] = useState()
  const [userConfirmPassword, setUserConfirmPassword] = useState()
  const theme = useTheme()
  const [email, setEmail] = useState()
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [resetRequested, setResetRequested] = React.useState(false)
  const [enteredMobile, setEnteredMobile] = useState()
  const [customerData, setCustomerData] = useState()
  const [isRegisteredMobileValidated, setIsRegisteredMobileValidated] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [isOTPViewVisible, setOTPViewVisible] = useState(false)
  const [isResetPasswordViewVisible, setIsResetPasswordViewVisible] = useState(false)
  const [secureTextEntryForPassword, setSecureTextEntryForPassword] = useState(true)
  const [secureTextEntryForConfirmPassword, setSecureTextEntryForConfirmPassword] = useState(true)
  const [areBothPasswordMatching, setAreBothPasswordMatching] = useState(false)
  const styles = useStyleSheet(themedStyles)
  const useEmailExists = useRequest(validateEmailExistsOrNot,
    {
      manual: true,
      onSuccess: (customerData) => {
        setCustomerData(customerData)
        setResetRequested(true)
      },
      onError: (err) => {
        if (err.message === 'EMAIL_DOES_NOT_EXISTS') {
          notificationMsg(translations['auth.forgotPassword.user.not.exists'], 'error')
        }
      }
    })
  const onResetPasswordButtonPress = () => {
    isResetButtonPressed = true
    let errorFlg = false
    if (isEmpty(email) || !validateEmail(email)) {
      setIsEmailValid(false)
      errorFlg = true
    }
    if (errorFlg) {
      return
    }
    useEmailExists.run(email)
  }
  const onGotoLogin = () => {
    navigation && navigation.navigate('SignIn')
  }
  const { translations } = useContext(LocalizationContext)
  const title = route.params?.title || translations['auth.forgotPassword']

  const renderError = () => {
    return (<Text category='p2' status='danger'>{translations['auth.invalid.email']}</Text>)
  }

  useEffect(() => {
    if (isResetButtonPressed && (isEmpty(email) || !validateEmail(email))) {
      setIsEmailValid(false)
    } else {
      setIsEmailValid(true)
    }
  }, [isResetButtonPressed, email])

  const validateMobile = () => {
    if (isEmpty(enteredMobile)) return
    const mob = unMask(enteredMobile)
    if (customerData?.primaryPhone === mob) {
      sendOtpHandler.run(mob)
    } else {
      notificationMsg(translations['auth.registered.mobile.invalid'], 'error')
      setEnteredMobile(undefined)
    }
  }

  const notificationMsg = (description, type) => {
    Toast.show({
      type: type,
      position: 'bottom',
      props: {
        title: translations['auth.forgotPassword.reset'],
        description: description
      }
    })
  }

  const sendOtpHandler = useRequest(async (mob) => otpService.sendOtp(mob),
    {
      manual: true,
      onSuccess: () => {
        setOTPViewVisible(true)
        setIsRegisteredMobileValidated(true)
      },
      onError: () => { notificationMsg(translations['auth.forgotPassword.ue'], 'error') }
    })
  const validateOtpHandler = useRequest(async (mob, otp) => await otpService.validateOtp(mob, otp),
    {
      manual: true,
      onSuccess: (res) => {
        if (!res.status) {
          notificationMsg(translations['otp.invalidOtp'], 'error')
        } else {
          setOtpVerified(true)
          setIsResetPasswordViewVisible(true)
          setOTPViewVisible(false)
        }
      },
      onError: () => { notificationMsg(translations['auth.forgotPassword.ue'], 'error') }
    })

  const onUpdatePassword = () => {
    console.log('Update Password')
  }
  const renderIconForPassWord = (props) => (
    <TouchableWithoutFeedback onPress={() => setSecureTextEntryForPassword(!secureTextEntryForPassword)}>
      <Icon {...props} name={secureTextEntryForPassword ? 'eye-off' : 'eye'} fill={theme['color-basic-600']} width={24} height={24} />
    </TouchableWithoutFeedback>
  )
  const renderIconForConfirmPassword = (props) => (
    <TouchableWithoutFeedback onPress={() => setSecureTextEntryForConfirmPassword(!secureTextEntryForConfirmPassword)}>
      <Icon {...props} name={secureTextEntryForConfirmPassword ? 'eye-off' : 'eye'} fill={theme['color-basic-600']} width={24} height={24} />
    </TouchableWithoutFeedback>
  )

  useEffect(() => {
    if ((userPassword !== userConfirmPassword)) {
      setAreBothPasswordMatching(false)
    } else {
      setAreBothPasswordMatching(true)
    }
  }, [userConfirmPassword, userPassword])
  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <ScreenTitle title={title} description={translations['auth.forgotPassword.enterEmail']} />
        {!resetRequested && !isRegisteredMobileValidated && (
          <>
            <View style={styles.formContainer}>
              <Input
                placeholder='Email'
                accessoryRight={FormIcons.FormEmailIcon}
                label={translations['auth.forget.password.registered.email']}
                value={email}
                size='large'
                status={(!isEmailValid && isResetButtonPressed) && 'danger'}
                caption={!isEmailValid ? renderError : <></>}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.buttonContanier}>
              <SpinnerButton disabled={isEmpty(email) || !validateEmail(email)} loading={useEmailExists.loading} onPress={onResetPasswordButtonPress}>{translations['auth.forgotPassword.reset']}</SpinnerButton>
            </View>
          </>
        )}
        {resetRequested && !isRegisteredMobileValidated &&
          <>
            <View style={styles.formContainer}>
              <Input
                style={styles.formInput}
                label={translations['form.registered.mobileNumber']}
                placeholder={translations['form.mobileNumber']}
                value={enteredMobile}
                keyboardType='numeric'
                status='basic'
                onChangeText={(text) => setEnteredMobile(mask(text, '99999 99999'))}
                accessoryLeft={() => (<Text appearance='hint'>+91 </Text>)}
                accessoryRight={FormIcons.FormMobileIcon}
              />
            </View>
            <View style={styles.buttonContanier}>
              <Button disabled={isEmpty(enteredMobile) || enteredMobile.length < 10} onPress={validateMobile}>{translations['form.validate.mobile']}</Button>
            </View>
          </>}
        {resetRequested && isRegisteredMobileValidated && isOTPViewVisible && !otpVerified && (
          <>
            <View style={styles.formContainer}>
              <OtpComponent
                primaryPhone={`+91 ${unMask(enteredMobile).substring(0, 5)} *****`}
                onResendOtp={() => sendOtpHandler.run(unMask(enteredMobile))}
                loading={sendOtpHandler.loading || validateOtpHandler.loading}
                onValidateOtp={(otp) => validateOtpHandler.run(unMask(enteredMobile), otp)}
                otpValid={otpVerified}
                numSecondsWaitForResend={2 * 60 * 1000}
                otpValidWindow={5 * 60 * 1000}
                size='small'
              />
            </View>
          </>
        )}
        {otpVerified && isResetPasswordViewVisible &&
          <>
            <View style={styles.formContainer}>
              <Input
                style={styles.passwordInput}
                secureTextEntry={secureTextEntryForPassword}
                placeholder={translations['form.password']}
                label={translations['form.password']}
                value={userPassword}
                caption={() => (<Text appearance='hint' status={userPassword?.length < 8 ? 'danger' : 'basic'} style={styles.captionText}>{translations['auth.password.criteria']}</Text>)}
                size='large'
                accessoryRight={renderIconForPassWord}
                onChangeText={setUserPassword}
              />
            </View>
            <View style={styles.formContainer}>
              <Input
                secureTextEntry={secureTextEntryForConfirmPassword}
                placeholder={translations['form.confirm.password']}
                label={translations['form.confirm.password']}
                value={userConfirmPassword}
                caption={() => (<Text appearance='hint' status={userConfirmPassword?.length < 8 ? 'danger' : 'basic'} style={styles.captionText}>{translations['auth.password.criteria']}</Text>)}
                size='large'
                accessoryRight={renderIconForConfirmPassword}
                onChangeText={setUserConfirmPassword}
              />
            </View>
            <View style={styles.buttonContanier}>
              <SpinnerButton disabled={!areBothPasswordMatching || isEmpty(userConfirmPassword) || isEmpty(userPassword) || userConfirmPassword?.length < 8 || userPassword?.length < 8} loading={false} onPress={onUpdatePassword}>{translations['form.confirm.update.password']}</SpinnerButton>
            </View>
          </>}
      </View>
    </KeyboardAwareScrollView>
  )
}

const themedStyles = StyleService.create({
  captionText: {
    fontSize: 12,
    fontWeight: '400'
  },
  passwordInput: {
    marginTop: 16
  },
  container: {
    paddingHorizontal: 16
  },
  formContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 24
  },
  forgotPasswordLabel: {
    zIndex: 1,
    alignSelf: 'center',
    marginTop: 24
  },
  content: {
    ...styleConstants.content
  },
  buttonContanier: {
    paddingVertical: 10
  }
})
