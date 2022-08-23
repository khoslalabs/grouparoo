import { useStyleSheet, StyleService, Text } from '@ui-kitten/components'
import React, { useState } from 'react'
import { View } from 'react-native'
import { calculateEmi } from '../../../../../../../../utils'
import AmountRangeSelector from '../../../../../../AmountRangeSelector'

const IndicativeLoanOfferField = (props) => {
  const styles = useStyleSheet(themedStyles)
  const [loanAmount, setLoanAmount] = useState(1000)
  const [tenure, setTenure] = useState(3)
  const emi = calculateEmi(loanAmount, tenure, '', '', 9)
  return (
    <>
      <View style={styles.rangeSelector}>
        <Text appearance='hint' category='label'>
          'Select the loan amount'
        </Text>
        <AmountRangeSelector
          value={loanAmount}
          step={1000}
          minimumValue={1000}
          maximumValue={5000}
          onChange={setLoanAmount}
        />
      </View>
      <View style={styles.rangeSelector}>
        <Text appearance='hint' category='label'>
          'Select the loan tenure (months)'
        </Text>
        <AmountRangeSelector
          value={tenure}
          step={3}
          minimumValue={3}
          maximumValue={24}
          onChange={setTenure}
          iconText=''
        />
      </View>
      <View style={styles.container}>
        <View>
          <Text appearance='hint' category='label' style={{ paddingTop: 6, paddingRight: 5 }}>Interest Rate:</Text>
        </View>
        <View>
          <Text appearance='default' category='h6'>9%</Text>
        </View>
      </View>
      <View style={styles.container}>
        <View>
          <Text appearance='hint' category='label' style={{ paddingTop: 6, paddingRight: 5 }}>EMI:</Text>
        </View>
        <View>
          <Text appearance='default' category='h6'>{emi}</Text>
        </View>
      </View>
      <View style={styles.container}>
        <View>
          <Text appearance='hint' category='label' style={{ paddingTop: 6, paddingRight: 5 }}>Processing Fee:</Text>
        </View>
        <View>
          <Text appearance='default' category='h6'>₹ {Math.round((loanAmount * 0.03))}</Text>
        </View>
      </View>
    </>
  )
}
const themedStyles = StyleService.create({
  rangeSelector: {
    marginTop: 16
  },
  container: {
    marginTop: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
})
export default IndicativeLoanOfferField
