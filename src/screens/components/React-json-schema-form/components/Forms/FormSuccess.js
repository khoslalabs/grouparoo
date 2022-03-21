import {
  Button,
  StyleService,
  Text,
  useStyleSheet
} from '@ui-kitten/components'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import React, { useContext } from 'react'
import { PaymentSuccessIcon } from '../../../ThemedIcons'
import { View } from 'react-native'
import { LocalizationContext } from '../../translation/Translation'
const FormSuccess = ({ isButtonVisible = true, description }) => {
  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)
  return (
    <View style={isButtonVisible ? styles.container : styles.containerIfBtnInvisible}>
      <View style={styles.iconContainer}>
        <PaymentSuccessIcon />
        <Text category='h1' status='success'>
          {translations.success}
        </Text>
        <Text category='s1' status='primary'>
          {description || translations['final.submit.message']}
        </Text>
      </View>
      {isButtonVisible &&
        <View style={styles.buttonContainer}>
          <Button status='primary'>{translations['text.okay']}</Button>
        </View>}
    </View>
  )
}

const themedStyles = StyleService.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  containerIfBtnInvisible: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: heightPercentageToDP(60)
  },
  buttonContainer: {
    margin: 16
  }
})

export default FormSuccess
