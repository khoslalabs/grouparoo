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
import { useSelector } from 'react-redux'
import MaskedInput from '../../textMask/text-input-mask'
import { useFormContext } from '../FormContext'

const accountTypes = ['Savings', 'Current']
const BankAccountConfirmationWidget = (props) => {
  const { rawErrors, value, onChange } = props
  const [isValid, setIsValid] = useState(!!isEmpty(rawErrors))
  const { translations } = useContext(LocalizationContext)
  const styles = useStyleSheet(themedStyles)
  const [selectedIndex, setSelectedIndex] = useState()
  const bankAccountTypeDisplayValue = selectedIndex ? accountTypes[selectedIndex.row] : props?.formData?.accountType
  const bankStatementData = useSelector(state => state.formDetails.bankStatementData)
  const bankName = bankStatementData?.statement?.bank_name
  const accountHolderName = bankStatementData?.statement?.identity?.name
  const accountNo = bankStatementData?.statement?.identity?.account_number
  const accounts = bankStatementData?.transaction_details?.accounts
  const ifsc = accounts && accounts.length > 0 ? accounts[0].ifsc : undefined
  const [userEnteredIfsc, setUserEnteredIfsc] = useState(props?.formData?.ifsc || undefined)
  const { theme } = useFormContext()

  const renderOption = (title, index) => (
    <SelectItem title={title} key={index} />
  )
  useEffect(() => {
    if (!isEmpty(value)) {
      setIsValid(true)
    }
  }, [value])
  const accountTypeChangeHandler = (index) => {
    setSelectedIndex(index)
  }
  useEffect(() => {
    if (!isEmpty(bankAccountTypeDisplayValue) && (!isEmpty(ifsc) || !isEmpty(userEnteredIfsc))) {
      onChange({
        ifsc: ifsc || userEnteredIfsc,
        accountType: bankAccountTypeDisplayValue
      })
    }
  }, [bankAccountTypeDisplayValue, ifsc, userEnteredIfsc])

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
              <Text style={styles.valueText} category='s1' appearance='default'>{accountHolderName}</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.bank.name']}</Text>
            </View>
            <View>
              <Text style={styles.valueText} category='s1' appearance='default'>{bankName?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.account.number']}</Text>
            </View>
            <View>
              <Text style={styles.valueText} category='s1' appearance='default'>{accountNo}</Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.rowDesign}>
            <View>
              <Text category='p1' appearance='hint'>{translations['bank.details.ifsc']}</Text>
            </View>
            <View>
              {!isEmpty(ifsc) && <Text style={styles.valueText} category='s1' appearance='default'>{ifsc}</Text>}
              {isEmpty(ifsc) && <MaskedInput
                style={{ width: 150 }}
                type='custom'
                options={{
                  mask: 'AAAASSSSSSS'
                }}
                includeRawValueInChangeText
                placeholder='XXXX1234567'
                value={userEnteredIfsc}
                onChangeText={(_, rawText) => setUserEnteredIfsc(rawText)}
                placeholderTextColor={theme.placeholderTextColor}
              />}
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
      {
        !isEmpty(props.errorSchema) && (
          <Text style={styles.error} category='p2' status='danger'>
            {translations['bank.details.required']}
          </Text>
        )
      }
    </>
  )
}

const themedStyles = StyleService.create({
  error: {
    marginVertical: 10
  },
  valueText: {
    fontWeight: 'bold'
  },
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
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  }

})

export default BankAccountConfirmationWidget
