import React, { useContext, useEffect, useState } from 'react'
import {
  Text,
  StyleService,
  useStyleSheet,
  Select,
  SelectItem
} from '@ui-kitten/components'
import { View, Image } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { LocalizationContext } from '../../../../translation/Translation'
import isEmpty from 'lodash.isempty'

const accountTypes = ['Savings', 'Current']
const BankAccountConfirmationWidget = (props) => {
  const { rawErrors, value, onChange } = props
  const [isValid, setIsValid] = useState(!!isEmpty(rawErrors))
  const { translations } = useContext(LocalizationContext)
  const styles = useStyleSheet(themedStyles)
  const [selectedIndex, setSelectedIndex] = useState()
  const bankAccountTypeDisplayValue = selectedIndex ? accountTypes[selectedIndex.row] : props.value

  const renderOption = (title) => (
    <SelectItem title={title} />
  )
  useEffect(() => {
    if (!isEmpty(value)) {
      setIsValid(true)
    }
  }, [value])
  const accountTypeChangeHandler = (index) => {
    setSelectedIndex(index)
    onChange(accountTypes[index.row])
  }
  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Image source={require('../../../../../../../assets/images/bank-icon.png')} style={styles.image} resizeMode='cover' />
        </View>
        <View style={styles.card}>
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.holder.name']}</Text>
            </View>
            <View>
              <Text category='h6' status='primary'>Saurabh Kumar</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.bank.name']}</Text>
            </View>
            <View>
              <Text category='h6' status='primary'>HDFC Bank</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.account.number']}</Text>
            </View>
            <View>
              <Text category='h6' status='primary'>55445454545454</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.ifsc']}</Text>
            </View>
            <View>
              <Text category='h6' status='primary'>HDFC00002497</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.account.type']}</Text>
            </View>
            <View>
              <Select
                style={{ width: 150 }}
                selectedIndex={selectedIndex}
                placeholder='Select'
                onSelect={accountTypeChangeHandler}
                value={bankAccountTypeDisplayValue}
                status={!isValid && 'danger'}
              >
                {accountTypes.map(renderOption)}
              </Select>
            </View>
          </View>
        </View>
      </View>
      <Text appearance='hint' category='label'>{translations['bank.details.hint']}</Text>
    </>
  )
}

const themedStyles = StyleService.create({
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: heightPercentageToDP('70%')
  },
  card: {
    width: widthPercentageToDP('85%'),
    marginBottom: 30
  },
  image: {
    width: widthPercentageToDP('40%'),
    height: widthPercentageToDP('40%')
  },
  line: {
    marginTop: 10,
    borderBottomColor: '#F0F0FF',
    borderBottomWidth: 1
  },
  rowDesign: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  }

})

export default BankAccountConfirmationWidget
