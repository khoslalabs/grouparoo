import React, { useContext, useState } from 'react'
import { View } from 'react-native'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import { widthPercentageToDP } from 'react-native-responsive-screen'

import { LoanOfferIcons } from '../ThemedIcons'
import { LocalizationContext } from '../../../components/Translation'
import { Card, Text, StyleService, useStyleSheet } from '@ui-kitten/components'
import SmallButtonSet from '../SmallButtonSet'
import styleConstants from '../../styleConstants'
import { rupeeFormatter, calculateEmi } from '../../../utils'
const Loading = () => (
  <Placeholder Animation={Fade} Left={PlaceholderMedia}>
    <PlaceholderLine width={80} />
    <PlaceholderLine />
    <PlaceholderLine width={30} />
  </Placeholder>
)

const LoanOfferCard = ({
  selected,
  onSelect,
  loading,
  loanOffer,
  loanAmount
}) => {
  // if (loading) {
  //   return <Loading />
  // }
  const { translations } = useContext(LocalizationContext)
  const repaymentDisplay = loanOffer.repayments.map(rp => translations[`period.${rp}ly`])
  const [selectedRepayment, setSelectedRepayment] = useState(loanOffer.defaultRepayment)
  // const isDisabled = loanAmount > loanOption.maxLoanAmount
  const loanEMI = calculateEmi(
    loanAmount,
    loanOffer.tenure,
    selectedRepayment,
    loanOffer.unit
  )

  const styles = useStyleSheet(themedStyles)
  return (
    <View style={styles.absoluteViewContainer}>
      <Card style={styles.cardContainer} onPress={() => onSelect(loanOffer.offerId, loanEMI)}>
        <View style={styles.contentContainer}>
          <View style={styles.cardTitleContainer}>
            {selected && (<LoanOfferIcons.IconSelected />)}
            {!selected && (<LoanOfferIcons.IconUnselected />)}
            <Text
              style={styles.heading}
              category='h5'
              status='info'
              appearance='hint'
            >
              <Text category='label'>
                {'₹ '}
              </Text>
              {rupeeFormatter(loanEMI)}
              <Text category='label'>
                {`/ ${translations[`period.${selectedRepayment}`]}`}
              </Text>
            </Text>
          </View>
          <View>
            <Text
              category='s1'
              appearance='hint'
            >
              {`${translations['period.for']} ${loanOffer.tenure} ${translations[`period.${loanOffer.unit}s`]}`}
            </Text>
          </View>
          {/* <View style={styles.smallButtonContainer}>
            <Text category='label' appearance='hint'>{translations['repayment.plain']}</Text>
            {loanOffer.repayments.length > 1 && (
              <SmallButtonSet
                displaySet={repaymentDisplay}
                values={loanOffer.repayments}
                onPress={setSelectedRepayment}
                selectedValue={selectedRepayment}
              />
            )}
            {loanOffer.repayments.length === 1 && (
              <Text category='info'>
                {`${translations[`period.${loanOffer.repayments[0]}ly`]}`}
              </Text>
            )}

          </View> */}
        </View>
      </Card>
      {loanOffer.reccomended && (
        <View style={styles.reccomended}>
          <Text appearance='alternative'>{translations['loanOffer.reccomended']}</Text>
        </View>
      )}
    </View>
  )
}

const themedStyles = StyleService.create({
  reccomended: {
    position: 'absolute',
    top: -16,
    left: '30%',
    borderWidth: 1,
    borderColor: 'color-primary-900',
    paddingVertical: 8,
    borderRadius: 36,
    backgroundColor: 'color-primary-900',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 12
  },
  cardContainer: {
    // position: 'absolute',
    // top: 20
    marginLeft: 4,
    ...styleConstants.loanOfferCard

  },
  absoluteViewContainer: {
    ...styleConstants.cardContainer,
    marginTop: 16
    // width: widthPercentageToDP('38%')
  },
  cardTitleContainer: {
    ...styleConstants.cardTitleContainer,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  smallButtonContainer: {
    marginTop: 32
  },
  contentContainer: {
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  heading: {
    ...styleConstants.heading,
    marginTop: 4
  },
  content: {
    ...styleConstants.content
  }
})

export default LoanOfferCard
