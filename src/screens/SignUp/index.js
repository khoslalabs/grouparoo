import React, { useContext, useEffect, useState } from 'react'
import { View, Linking } from 'react-native'
import isEmpty from 'lodash.isempty'
import isUndefined from 'lodash.isundefined'
import { useRequest } from 'ahooks'
import { mask, unMask } from 'react-native-mask-text'
import apiServices from '../../apiService'

import {
  Button,
  CheckBox,
  Input,
  StyleService,
  Text,
  useStyleSheet,
  Spinner
} from '@ui-kitten/components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { FormIcons } from '../components/ThemedIcons'
import { LocalizationContext } from '../../components/Translation'
import styleConstants from '../styleConstants'
import ScreenTitle from '../components/ScreenTitle'
import { validateFormData } from './validations'
import { config } from '../../config'
import { useDispatch } from 'react-redux'
const MOBILE_MASK = '99999 99999'

const SignUp = ({ navigation, route }) => {
  const [liveValidate, setLiveValidate] = useState(false)
  const { translations } = useContext(LocalizationContext)
  const title = route.params?.title || translations['auth.signUp']
  const [formData, setFormData] = useState(route.params?.formData || {
    fullName: '',
    email: '',
    primaryPhone: '',
    whatsappPermission: true
  })
  const [error, setError] = useState({})
  const styles = useStyleSheet(themedStyles)
  const { loading, run } = useRequest(apiServices.sendOtp, { manual: true })
  const dispatch = useDispatch()

  // Reset the Account Exists Error
  // useEffect(async () => { await dispatch.authentication.resetAccountExistsFlag() }, [])

  const onDataChange = (key, value) => {
    formData[key] = value
    if (key === 'primaryPhone') {
      formData.primaryPhone = mask(value, MOBILE_MASK)
    } else {
      formData[key] = value
    }
    if (liveValidate) {
      const errors = validateFormData({
        fullName: formData.fullName,
        email: formData.email,
        primaryPhone: unMask(formData.primaryPhone)
      })
      setError(errors)
    }
    setFormData(Object.assign({}, formData))
  }
  const onSignUpButtonPress = async () => {
    const unmaskedPhone = formData.primaryPhone && unMask(formData.primaryPhone)
    const errors = validateFormData({
      fullName: formData.fullName,
      email: formData.email,
      primaryPhone: unmaskedPhone
    })
    if (isUndefined(formData.termsAccepted) || formData.termsAccepted === false) {
      errors.termsAccepted = true
    }
    if (isEmpty(errors)) {
      await run(unmaskedPhone)
      formData.primaryPhone = unmaskedPhone
      navigation.navigate('Otp', { formData })
    } else {
      setLiveValidate(true)
      setError(errors)
    }
  }
  const onSignInButtonPress = () => {
    navigation.navigate('SignIn', { formData })
  }

  const renderTermsLabel = React.useCallback(
    evaProps => {
      // in order to have multiple colored text
      const modifiedProps = JSON.parse(JSON.stringify(evaProps))
      delete modifiedProps.style.color
      return (
        <Text {...evaProps} category='p1' appearance='hint'>
          {`${translations['auth.tnc']} `}
          <Text
            {...modifiedProps}
            category='p1'
            status='info'
            onPress={() => Linking.openURL(config.termsUrl)}
          >
            {translations['auth.tnc.terms']}
          </Text>
          {' & '}
          <Text
            {...modifiedProps}
            status='info'
            category='p1'
            onPress={() => Linking.openURL(config.ppUrl)}
          >
            {translations['auth.tnc.privacy']}
          </Text>
        </Text>
      )
    },
    []
  )
  const renderWhatsappLabel = React.useCallback(
    evaProps => (
      <Text {...evaProps} category='p1' appearance='hint'>
        {translations['form.whatsappTnc']}
      </Text>
    ),
    []
  )
  const loadingIndicator = props => {
    if (!loading) {
      return null
    }
    return (
      <View style={[props.style, styles.indicator]}>
        <Spinner size='small' status='basic' />
      </View>
    )
  }
  return (
    <KeyboardAwareScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <ScreenTitle
        title={title}
        description={translations['auth.signup.excited']}
      />
      <View style={styles.formContainer}>
        <View>
          <Input
            placeholder={translations['form.placeholder.name']}
            label={translations['form.name']}
            autoCapitalize='words'
            value={formData.fullName}
            status={error.fullName && 'danger'}
            onChangeText={(v) => onDataChange('fullName', v)}
            caption={() => (<Text appearance='hint' category='label'>{translations['form.asOnPan']}</Text>)}
            accessoryRight={FormIcons.FormNameIcon}
          />
          <Input
            style={styles.formInput}
            placeholder=''
            label={translations['form.email']}
            status={error.email && 'danger'}
            value={formData.email}
            keyboardType='email-address'
            onChangeText={(v) => onDataChange('email', v.trim())}
            accessoryRight={FormIcons.FormEmailIcon}
          />
          <Input
            style={styles.formInput}
            label={translations['form.mobileNumber']}
            placeholder={translations['form.mobileNumber']}
            value={formData.primaryPhone}
            keyboardType='numeric'
            status={error.primaryPhone && 'danger'}
            onChangeText={(v) => onDataChange('primaryPhone', v)}
            accessoryLeft={() => (<Text appearance='hint'>+91 </Text>)}
            accessoryRight={FormIcons.FormMobileIcon}
          />
          <CheckBox
            style={styles.termsCheckBox}
            checked={formData.whatsappPermission}
            onChange={checked => onDataChange('whatsappPermission', checked)}
          >
            {renderWhatsappLabel}
          </CheckBox>
          <CheckBox
            style={styles.termsCheckBox}
            checked={formData.termsAccepted}
            status={error.termsAccepted && 'danger'}
            onChange={checked => onDataChange('termsAccepted', checked)}
          >
            {renderTermsLabel}
          </CheckBox>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            style={styles.signUpButton}
            onPress={onSignUpButtonPress}
            accessoryRight={loadingIndicator}
          >
            {translations['auth.signUp'].toUpperCase()}
          </Button>
          <Button
            style={styles.signInButton}
            appearance='ghost'
            status='primary'
            onPress={onSignInButtonPress}
          >
            {translations['auth.signInReminder']}
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    marginTop: 'auto'
  },
  formContainer: {
    marginTop: 32,
    justifyContent: 'space-between'
  },
  signInButton: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 0
  },
  signUpButton: {
    marginTop: 16,
    marginBottom: 0
  },
  content: {
    ...styleConstants.content
  },
  formInput: {
    marginTop: 16
  },
  termsCheckBox: {
    marginTop: 20
  },
  indicator: {
    alignItems: 'center'
  }
})

export default SignUp
