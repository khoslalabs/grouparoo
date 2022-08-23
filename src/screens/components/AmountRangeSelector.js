import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from '@ui-kitten/components'
import { rupeeFormatter } from '../../utils'
import Slider from '@react-native-community/slider'
import { heightPercentageToDP } from 'react-native-responsive-screen'
const AmountRangeSelector = ({
  value,
  disabled,
  onChange,
  step,
  minimumValue,
  maximumValue,
  iconText = '₹ '
}) => {
  const theme = useTheme()
  return (
    <>
      <View style={styles.container}>
        <Slider
          style={styles.slider}
          value={value}
          step={step}
          disabled={disabled}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          onValueChange={onChange}
          thumbTintColor={theme['color-primary-500']}
          minimumTrackTintColor={theme['color-primary-500']}
        />
      </View>
      <View style={styles.textdisplayConatiner}>
        <Text
          status='primary'
          category='s1'
        >
          <Text category='label' status='primary'>
            {iconText}
          </Text>
          {rupeeFormatter(minimumValue)}
        </Text>
        <Text
          status='primary'
          category='s1'
          appearence='hint'
        >
          <Text category='label' status='primary'>
            {iconText}
          </Text>
          {rupeeFormatter(maximumValue)}
        </Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  textdisplayConatiner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  slider: {
    flex: 1,
    width: '100%',
    height: 30
  },
  rangeContainer: {
    marginBottom: heightPercentageToDP('5%')
  }
})

export default AmountRangeSelector
