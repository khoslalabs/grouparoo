import React from 'react'

import { Provider } from 'react-redux'
import { AppearanceProvider } from 'react-native-appearance'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'
import ErrorBoundary from 'react-native-error-boundary'
import notifee from '@notifee/react-native'
import messaging from '@react-native-firebase/messaging'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import * as eva from '@eva-design/eva'
import RNOtpVerify from 'react-native-otp-verify'
import { useRequest } from 'ahooks'
import customMappingsEva from './src/themes/customMappingsEva.json'
import appTheme from './src/themes/blue600.json'
import MainApp from './src/MainApp'
import { LocalizationProvider } from './src/components/Translation'
import store from './src/store'
import { AppStorage } from './src/services/app-storage.service'
import { checkNotificationPermissions, onMessageReceived } from './src/services/push.notifications'
import AppStateManager from './src/components/AppStateManager'
import ErrorFallbackComponent from './src/screens/Errors/ErrorFallbackComponent'
// import SplashScreen from './src/SplashScreen'

const initialSetup = async () => {
  const enabled = await checkNotificationPermissions()
  await AppStorage.toggleFirstTime()
  await AppStorage.togglePermissionRequested()
  await AppStorage.toggleIntroScreen()
  await bootstrap()
  return enabled
}
async function bootstrap () {
  const initialNotification = await notifee.getInitialNotification()
  if (initialNotification) {
    console.log('Notification caused application to open', initialNotification.notification)
    console.log('Press action used to open the app', initialNotification.pressAction)
  }
}
const App = props => {
  // Check for notification permissions and get the fcm token for the app
  const { loading, data } = useRequest(() => initialSetup())
  // This will print the message hash to be appended.
  // see https://developers.google.com/identity/sms-retriever/verify
  // When app state changes send state to server. Also manage notifications and push it to client.
  RNOtpVerify.getHash()
    .then(hash => {
      console.log('Use this hash to construct otp message', hash)
      console.log('A sample message -')
      console.log(`
      <#> Dear User,
      1091 is your OTP for logging into NovoLaon. (Remaining Time: 5 minutes and 0 seconds)
       ${hash[0]}
    `)
    })
    .catch(error => console.log(error))
  // Handle Notifications and background events using notifee.
  messaging().onMessage(onMessageReceived)
  messaging().setBackgroundMessageHandler(onMessageReceived)
  return (
    <>
      <IconRegistry icons={[EvaIconsPack]} />
      <AppearanceProvider>
        <Provider store={store}>
          <ApplicationProvider
            {...eva}
            theme={{ ...eva.light, ...appTheme }}
            customMapping={customMappingsEva}
          >
            <SafeAreaProvider>
              {/* <SplashScreen /> */}
              <LocalizationProvider>
                <AppStateManager>
                  <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
                    <MainApp {...props} notificationsEnabled={data} loading={loading} />
                  </ErrorBoundary>
                </AppStateManager>
              </LocalizationProvider>
            </SafeAreaProvider>
          </ApplicationProvider>
        </Provider>
      </AppearanceProvider>
    </>
  )
}

export default App
