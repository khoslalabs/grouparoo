import React from 'react'
import {
  useStyleSheet,
  StyleService,
  TopNavigation,
  TopNavigationAction,
  Icon,
  useTheme
} from '@ui-kitten/components'
import styleConstants from '../styleConstants'
import SafeAreaLayout from '../../components/SafeAreaLayout.component'
import { CallIcon } from '../../components/Icons.component'
const AuthWrapper = props => {
  const styles = useStyleSheet(themedStyles)
  const theme = useTheme()
  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
  )
  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  )
  const navigateBack = () => {
    props.navigation.goBack()
  }
  const navigateToContactUs = () => {
    props.navigation.navigate('ContactUs')
  }
  const renderRightActions = () => (
    <TopNavigationAction onPress={navigateToContactUs} icon={(imageProps) => <CallIcon {...imageProps} fill={theme['color-primary-500']} />} />
  )
  return (
    <SafeAreaLayout style={styles.safeArea} insets='top' level='1'>
      <TopNavigation
        style={styles.topNavigationStyle}
        alignment='center'
        accessoryLeft={BackAction}
        accessoryRight={renderRightActions}
      // title={() => <Text category='h4' status='primary'>{config.appName}</Text>}
      />
      {props.children}
    </SafeAreaLayout>
  )
}

const themedStyles = StyleService.create({
  safeArea: {
    ...styleConstants.authScreen
  },
  topNavigationStyle: {
    backgroundColor: 'background-basic-color-1'
  }
})

export default AuthWrapper
