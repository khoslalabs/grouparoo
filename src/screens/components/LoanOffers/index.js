import React, { useState } from 'react'
import { View } from 'react-native'
import { StyleService, useStyleSheet } from '@ui-kitten/components'
import LoanOffersPerProduct from './LoanOffersPerProduct'
import { loanOfferPart2 } from '../../../test/loanOffers'
import AmountRangeSelector from '../AmountRangeSelector'
import { LoanAmountDisplayBig } from '../ValueDisplayComponent'
import { config } from '../../../config'
const LoanOffers = ({
  currentLoanAmount,
  selectedLoanOffer = {},
  onOfferSelected,
  loanOffers
}) => {
  loanOffers = loanOffers || loanOfferPart2
  const styles = useStyleSheet(themedStyles)
  const [loanAmount, setLoanAmount] = useState(
    currentLoanAmount || config.TERM_LOAN_MIN_AMOUNT
  )
  const [editLoanAmount, setEditLoanAmount] = useState(false)
  const onSelectLoanOffer = ({
    productId,
    offerId,
    finalLoanTenure,
    finalInstallmentFrequency,
    finalEmiAmount,
    unit
  }) => {
    onOfferSelected({
      productId,
      offerId,
      finalLoanAmount: loanAmount,
      finalLoanTenure,
      finalInstallmentFrequency,
      finalEmiAmount,
      unit
    })
  }
  return (
    <View>
      <View>
        <LoanAmountDisplayBig
          value={loanAmount}
          hasEdit
          editLoanAmount={editLoanAmount}
          setEditLoanAmount={setEditLoanAmount}
        />
      </View>
      {editLoanAmount && (
        <View style={styles.rangeSelector}>
          <AmountRangeSelector
            value={loanAmount}
            step={config.TERM_LOAN_AMOUNT_STEP}
            minimumValue={config.TERM_LOAN_MIN_AMOUNT}
            maximumValue={config.TERM_LOAN_MAX_AMOUNT}
            onChange={setLoanAmount}
          />
        </View>
      )}
      <View>
        {loanOffers.map((lo, ix) => (
          <LoanOffersPerProduct
            key={`loan-offer-${ix}`}
            loanOption={lo}
            selectedLoanOffer={selectedLoanOffer}
            onSelect={onSelectLoanOffer}
            loanAmount={loanAmount}
          />
        ))}
      </View>
    </View>
  )
}
const themedStyles = StyleService.create({
  rangeSelector: {
    marginTop: 16
  }
})
export default LoanOffers
