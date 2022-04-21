import orderBy from 'lodash.orderby'
const loanApplicationSteps = {
  name: 'loanApplicationSteps',
  state: [
    {
      order: 0,
      title: 'application.form.title',
      completeTitle: 'application.form.complete',
      action: 'application.form.action'
    },
    {
      order: 1,
      title: 'application.cpv.title',
      completeTitle: 'application.cpv.complete',
      action: 'application.cpv.action'
    },
    {
      order: 2,
      title: 'application.applicationForm.title',
      completeTitle: 'application.applicationForm.complete',
      action: 'application.kyc.action'
    },
    {
      order: 3,
      title: 'application.disbursement.title',
      completeTitle: 'application.disbursement.complete',
      action: 'application.disbursement.action'
    }
  ],
  selectors: {
    getLoanApplicationSteps: () => rootState => {
      return orderBy(rootState.loanApplicationSteps, ['order'], ['asc'])
    },
    getCurrentStep: select => (rootState, { loanApplicationId }) => {
      return {
        step: loanApplicationSteps[3],
        index: 3
      }
    }
  },
  effects: {},
  reducers: {}
}
export default loanApplicationSteps
