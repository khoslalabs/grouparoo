import React, { useContext, useEffect, useState } from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import { useRequest } from 'ahooks'
import { useDispatch, useSelector } from 'react-redux'
import {
  Button,
  Input,
  Text,
  StyleService,
  useStyleSheet,
  Spinner,
  useTheme,
  Icon
} from '@ui-kitten/components'
import ScreenTitle from '../components/ScreenTitle'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { LocalizationContext } from '../../components/Translation'
import styleConstants from '../styleConstants'
import Toast from 'react-native-toast-message'
import isEmpty from 'lodash.isempty'

const registerUser = async (dispatch, { password, formData }) => {
  const registerResoponse = await dispatch.authentication.registerOrUpdateUser({
    formData,
    password
  })
  return registerResoponse
}
let isSignInBtnClicked = false
const SetPassword = ({ navigation, route }) => {
  const { formData } = route.params
  const dispatch = useDispatch()
  const createAccount = useRequest(registerUser, {
    manual: true
  })
  const [userPassword, setUserPassword] = React.useState()
  const [disabled, setDisabled] = React.useState(false)
  const [isUserPasswordValid, setIsUserPasswordValid] = useState(true)
  const { translations } = useContext(LocalizationContext)
  const title = route.params?.title || translations['auth.Password']
  const isAccountExists = useSelector(state => state.authentication.accountExists)
  const isLoggedIn = useSelector(state => state.authentication.isLoggedIn)
  const styles = useStyleSheet(themedStyles)
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const theme = useTheme()
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }
  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} fill={theme['color-basic-600']} width={24} height={24} />
    </TouchableWithoutFeedback>
  )

  useEffect(() => {
    if (isSignInBtnClicked) {
      if (userPassword && userPassword.length >= 8) {
        setIsUserPasswordValid(true)
      } else {
        setIsUserPasswordValid(false)
      }
    }
  }, [userPassword, isSignInBtnClicked])

  useEffect(() => {
    if (isAccountExists && !isLoggedIn) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        props: {
          title: translations['app.set.password'],
          description: translations['app.signUp.account.exists']
        }
      })
      navigation.navigate('SignIn')
    }
  }, [isAccountExists, isLoggedIn])

  const onSignInButtonPress = async () => {
    isSignInBtnClicked = true
    console.log(userPassword)
    if (isEmpty(userPassword) || userPassword.length < 8) {
      setIsUserPasswordValid(false)
    } else {
      setDisabled(true)
      await createAccount.run(dispatch, {
        password: userPassword,
        formData
      })
      setDisabled(false)
    }
  }
  const loadingIndicator = props => {
    if (!createAccount.loading) {
      return null
    }
    return (
      <View style={[props.style, styles.indicator]}>
        <Spinner size='small' status='basic' />
      </View>
    )
  }
  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <ScreenTitle title={title} description={translations['auth.setPassword.desc']} />
          <Input
            style={styles.passwordInput}
            secureTextEntry={secureTextEntry}
            placeholder={translations['form.password']}
            label={translations['form.password']}
            value={userPassword}
            caption={() => (<Text appearance='hint' status={!isUserPasswordValid ? 'danger' : 'basic'} style={styles.captionText}>{translations['auth.password.criteria']}</Text>)}
            size='large'
            accessoryRight={renderIcon}
            onChangeText={setUserPassword}
          />
        </View>
        <View style={styles.bottomButtonContainer}>
          <Button
            status='primary'
            style={styles.registerButton}
            onPress={onSignInButtonPress}
            accessoryRight={loadingIndicator}
            disabled={disabled}
          >
            {translations['auth.signInButton']}
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
    paddingHorizontal: 16,
    justifyContent: 'space-between'
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 0
  },
  content: {
    ...styleConstants.content
  },
  formContainer: {
    flex: 1,
    marginTop: 32
  },
  passwordInput: {
    marginTop: 16
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400'
  },
  indicator: {
    alignItems: 'center'
  },
  bottomButtonContainer: {
    paddingTop: 32,
    justifyContent: 'flex-end'
  }
})

export default SetPassword
