import { useStyleSheet, StyleService, Text } from '@ui-kitten/components'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { calculateEmi } from '../../../../../../../../utils'
import AmountRangeSelector from '../../../../../../AmountRangeSelector'

const IndicativeLoanOfferField = (props) => {
  const exShowroomPrice = useSelector(state => state.formDetails?.selectedVehicleModel?.exShowroomPrice)
  const maxLoanAmount = Math.ceil(exShowroomPrice - (exShowroomPrice * 0.01))
  const styles = useStyleSheet(themedStyles)
  const [loanAmount, setLoanAmount] = useState(maxLoanAmount)
  const [tenure, setTenure] = useState(24)
  const emi = calculateEmi(loanAmount, tenure, '', '', 9)

  useEffect(() => {
    props.onChange({
      loanAmount, emi, tenure, interestRate: 9
    })
  }, [loanAmount])

  return (
    <>
      <View style={styles.rangeSelector}>
        <Text appearance='hint' category='label'>
          'Select the loan amount'
        </Text>
        <AmountRangeSelector
          value={maxLoanAmount}
          step={1000}
          minimumValue={1000}
          maximumValue={maxLoanAmount}
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
          <Text appearance='default' category='h6'>₹ {emi}</Text>
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
