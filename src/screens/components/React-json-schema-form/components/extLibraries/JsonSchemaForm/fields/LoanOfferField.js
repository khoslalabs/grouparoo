import { useRequest } from 'ahooks'
import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoanOffers from '../../../../../LoanOffers'
import isEmpty from 'lodash.isempty'
import { StyleSheet } from 'react-native'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import { Text } from '@ui-kitten/components'
import { LocalizationContext } from '../../../../translation/Translation'
const Loading = () => (
  <>
    <Placeholder Animation={Fade} Left={PlaceholderMedia}>
      <PlaceholderLine width={80} />
      <PlaceholderLine />
      <PlaceholderLine width={30} />
    </Placeholder>
    <Placeholder Animation={Fade} Left={PlaceholderMedia}>
      <PlaceholderLine width={80} />
      <PlaceholderLine />
      <PlaceholderLine width={30} />
    </Placeholder>
  </>
)

const getAllLoanOffers = async (dispatch, loanApplicationId) => {
  await dispatch.loanOffers.getOffersForApplication({ loanApplicationId })
}
const LoanOffersWidget = (props) => {
  const { translations } = useContext(LocalizationContext)
  const dispatch = useDispatch()
  const loanApplicationId = useSelector(state => state.loanApplications.currentLoanApplicationId)
  const { loading } = useRequest(() => getAllLoanOffers(dispatch, loanApplicationId))
  const loanAmount = useSelector((state) => state.formDetails.formData.loanAmount)
  const loanOffers = useSelector((state) => state.loanOffers[loanApplicationId] ? state.loanOffers[loanApplicationId] : [])
  console.log('Loan Offers from appWrite-->', loanOffers)
  const onOfferSelected = (loanOffer) => {
    props.onChange(loanOffer)
  }
  return (
    <>
      {
        !isEmpty(props.errorSchema) && (
          <Text style={styles.error} category='p2' status='danger'>
            {translations['loan.offer.error.required']}
          </Text>
        )
      }
      {loading && <Loading />}
      {!loading &&
        <LoanOffers
          currentLoanAmount={loanAmount}
          onOfferSelected={onOfferSelected}
          selectedLoanOffer={props.formData}
          loanOffers={loanOffers}
        />}
    </>
  )
}

const styles = StyleSheet.create({
  error: {
    marginVertical: 10
  }
})
export default LoanOffersWidget
