import React, { useState } from 'react'
import LottieView from 'lottie-react-native'
import { Modal, View, StyleSheet } from 'react-native'
const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true)
  const handleAnimationFinish = () => {
    setIsVisible(false)
  }
  return (
    <>
      <Modal visible={isVisible} animationType='fade' presentationStyle='fullScreen' style={styles.modal}>
        <View style={{ flex: 1, backgroundColor: '#00005A' }}>
          <LottieView
            source={require('../rocket.json')}
            loop={false}
            autoPlay
            onAnimationFinish={handleAnimationFinish}
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modal: {
    // margin: 0, // This is the important style you need to set
    // backgroundColor: 'black',
    // alignItems: undefined,
    // justifyContent: undefined
  }
})

export default SplashScreen
