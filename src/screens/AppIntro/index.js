import React from 'react'
import { StyleSheet, Text, ImageBackground, Dimensions, View } from 'react-native'
import AppIntroSlider from 'react-native-app-intro-slider'
import { TouchableOpacity } from 'react-native-gesture-handler'
const slides = [
  {
    key: 1,
    imageSource: require('../../assets/images/intro/3.jpg')
  },
  {
    key: 2,
    imageSource: require('../../assets/images/intro/1.jpg')
  },
  {
    key: 3,
    imageSource: require('../../assets/images/intro/2.jpg')
  },
  {
    key: 4,
    imageSource: require('../../assets/images/intro/4.jpg')
  }
]

const AppIntro = ({ navigation }) => {
  const _renderItem = ({ item }) => {
    return (
      <>
        {(item.key === 1 || item.key === 2 || item.key === 3 || item.key === 4) && (
          <ImageBackground source={item.imageSource} resizeMode='stretch' style={styles.image}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.bottomButton} onPress={_onDone}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        )}
      </>
    )
  }

  const _onDone = () => {
    //  Need to fix it later
    navigation.navigate('SignIn')
  }

  return (
    <AppIntroSlider
      showDoneButton={false}
      showNextButton={false}
      showSkipButton={false}
      activeDotStyle={{
        width: 10,
        height: 10,
        marginLeft: 16,
        backgroundColor: '#CCCCFF',
        marginBottom: 120
      }}
      dotStyle={{
        width: 10,
        height: 10,
        marginLeft: 16,
        backgroundColor: 'transparent',
        marginBottom: 120,
        borderWidth: 1,
        borderColor: '#CCCCFF'
      }}
      renderItem={_renderItem}
      data={slides}
      onDone={_onDone}
    />
  )
}

export default AppIntro

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  bottomButton: {
    backgroundColor: '#CCCCFF',
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width - 25,
    height: 54,
    marginBottom: 16
  },
  buttonText: {
    color: '#3E2B1D',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  }
})
