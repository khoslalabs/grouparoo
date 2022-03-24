import { useRequest } from 'ahooks'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoanOffers from '../../../../../LoanOffers'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
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

export default LoanOffersWidget
