import React, { useContext } from 'react'
import { OnboardNavigationScreens } from '../screens/NavigationScreens'
import { LocalizationContext } from '../components/Translation'
import LoadingSpinner from '../screens/components/LoadingSpinner'
import { createStackNavigator } from '@react-navigation/stack'

// When logging out, a pop animation feels intuitive
// You can remove this if you want the default 'push' animation
const OnboardingStack = createStackNavigator()
const OnboardNavigator = (props) => {
  const { translations } = useContext(LocalizationContext)
  if (props.loading) {
    return <LoadingSpinner />
  }
  const { screens, initialRouteName } = OnboardNavigationScreens(props.screenProps)
  return (
    <>
      <OnboardingStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animationEnabled: false
        }}
      >
        {screens.map((screen, ix) => (
          <OnboardingStack.Screen
            key={`onboard-${ix}`}
            name={screen?.name}
            component={screen?.Component}
            initialParams={{ title: translations[screen.title] }}
            options={{
              animationTypeForReplace: 'push',
              title: translations[screen.title]
            }}
          />
        ))}
      </OnboardingStack.Navigator>
    </>
  )
}

export default OnboardNavigator
