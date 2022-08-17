import React, { useContext } from 'react'
import { View } from 'react-native'
import { Text, StyleService, useStyleSheet, List } from '@ui-kitten/components'
import { LocalizationContext } from '../../../components/Translation'
import { InterestDisplay } from '../ValueDisplayComponent'
import LoanOfferCard from './LoanOfferCard'
const LoanOffersPerProduct = ({
  loanOption,
  selectedLoanOffer,
  onSelect,
  loanAmount,
  loading
}) => {
  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)
  const { offerId, productId } = selectedLoanOffer
  const isThisProduct = productId === loanOption.productId
  const onOfferSelect = (offerId, emi) => {
    const tempselctedLoanOffer = loanOption?.offers?.find(
      (item) => offerId === item.offerId
    )
    onSelect({
      productId: loanOption.productId,
      offerId,
      finalLoanTenure: tempselctedLoanOffer?.tenure,
      finalInstallmentFrequency: tempselctedLoanOffer?.defaultRepayment,
      finalLoanAmount: loanAmount,
      finalEmiAmount: emi,
      unit: tempselctedLoanOffer?.unit
    })
  }
  const renderLoanOfferCard = ({ item }) => {
    return (
      <LoanOfferCard
        loanOffer={item}
        selected={isThisProduct && item.offerId === offerId}
        onSelect={onOfferSelect}
        loading={loading}
        loanAmount={loanAmount}
        interestRate={loanOption.estimatedInterestRate}
      />
    )
  }
  return (
    <View style={styles.optionContainer}>
      {loanOption.heading &&
        <View style={styles.titleContainer}>
          <View>
            <Text category='h6' appearance='hint'>
              {loanOption.heading}
            </Text>
          </View>
          <View style={{ marginLeft: 50 }}>
            <InterestDisplay
              label={translations['loan.interestRate']}
              interestRate={loanOption.estimatedInterestRate}
              horizontal
            />
          </View>
        </View>}
      <List
        style={styles.listStyle}
        contentContainerStyle={styles.horizontalList}
        horizontal
        showsHorizontalScrollIndicator
        data={loanOption.offers}
        renderItem={renderLoanOfferCard}
      />
    </View>
  )
}

const themedStyles = StyleService.create({
  optionContainer: {
    marginVertical: 16
  },
  listStyle: {
    backgroundColor: 'background-basic-color-1'
  },
  titleContainer: {
    marginBottom: 8,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    JustifyContent: 'space-between'
  },
  optionsContainer: {
    marginVertical: 8,
    marignHorizontal: -16
  },
  horizontalList: {
    // position: 'absolute',
    top: 0,
    marginVertical: 16,
    overflow: 'visible',
    backgroundColor: 'background-basic-color-1'
  }
})

export default LoanOffersPerProduct
