import React from 'react'
import isUndefined from 'lodash.isundefined'
import { View } from 'react-native'
import { connect } from 'react-redux'
import { withStyles } from '@ui-kitten/components'
import store from '../../store'
import JsonSchemaForm from '../components/React-json-schema-form'

class ApplicationFormNative extends React.PureComponent {
  async componentDidMount () {
    if (isUndefined(this.props.jwt)) {
      try {
        await this.props.getCustomerJwt()
        // cant generate link from here, as account type we are taking in first step of agreement flow
        // if (this.props.isAgreement) {
        //   try {
        //     await this.props.generateLoanAgreementLink(this.props.currentLoanApplication.loanApplicationId)
        //   } catch (e) {
        //     console.log(e)
        //     throw new Error('CANNOT_GENERATE_LOAN_AGREEMENT_LINK')
        //   }
        // }
      } catch (err) {
        console.log(err)
        console.log('CANNOT_GET_JWT')
      }
    }
  }

  render () {
    const { currentLoanApplication, borrowingEntity, jwt, isAgreement, navigation,formId,stepSchemaName } = this.props
    const { eva: { style } } = this.props
    // const formId = isAgreement ? borrowingEntity.loanAggrementFormId : borrowingEntity.loanAssessmentFormId
    // const stepSchemaName = isAgreement ? borrowingEntity.stepsAgreementMobile : borrowingEntity.stepsAssessmentMobile
    return (
      <View style={style.container}>
        <JsonSchemaForm
          currentFormData={currentLoanApplication}
          formId={formId}
          stepSchemaName={stepSchemaName}
          token={jwt}
          navigation={navigation}
        />
      </View>
    )
  }
}
const mapStateToProps = (state) => {
  const loanTypes = store.select.loanTypes.getLoanTypes(state)
  const defaultLoanType = store.select.loanTypes.getDefaultLoanType(state)
  const borrowingEntity = store.select.borrowingEntities.getBorrowingEntity(state)
  const jwt = store.select.customer.getJwt(state)
  return {
    loanTypes,
    defaultLoanType,
    jwt,
    borrowingEntity
  }
}
const mapDispatchToProps = (dispatch) => ({
  getCustomerJwt: () => dispatch.customer.getCustomerJwt()
  // generateLoanAgreementLink: (loanApplicationId) => dispatch.loanApplications.generateLoanAgreement({ loanApplicationId })
})
const Component = connect(mapStateToProps, mapDispatchToProps)(ApplicationFormNative)
export default withStyles(Component, themes => ({
  container: {
    flex: 1,
    justifyContent: 'flex-start'
  }
}))
