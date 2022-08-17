import { CheckBox } from '@ui-kitten/components'
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import DownloadComponent from '../common/DownloadComponent'
import { LocalizationContext } from '../../../../translation/Translation'
import { useDispatch, useSelector } from 'react-redux'
import PdfPreviewComponent from '../common/PdfPreviewComponent'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import LoadingSpinner from '../../../../../LoadingSpinner'
import { useRequest } from 'ahooks'
const resourceFactoryConstants = new ResourceFactoryConstants()

const generateLoanAgreement = async (dispatch, loanApplicationId) => {
  await dispatch.loanApplications.generateLoanAgreement({ loanApplicationId })
}

const LoanAgreementWidget = (props) => {
  const state = useSelector(state => state)
  const dispatch = useDispatch()
  const currentLoanApplicationId = state.loanApplications.currentLoanApplicationId
  const { loading } = useRequest(() => generateLoanAgreement(dispatch, currentLoanApplicationId))
  const { translations } = useContext(LocalizationContext)
  const [show, setShow] = useState(true)
  const [loanAgreementUrl, setLoanAgreementUrl] = useState()
  const [loanAgreementId, setLoanAgreementId] = useState()

  useEffect(() => {
    if (!loading && !loanAgreementId) {
      const temp = state?.loanApplications?.applications[state.loanApplications.currentLoanApplicationId].loanAgreementId
      setLoanAgreementId(temp)
      setLoanAgreementUrl(`${resourceFactoryConstants.constants.lending.downloadFile}${temp}`)
    }
  }, [loading])

  return (
    <>
      <LoadingSpinner visible={show || loading} />
      <View style={styles.container}>
        {loanAgreementUrl && <PdfPreviewComponent agreementUrl={loanAgreementUrl} onLoadComplete={setShow} />}
      </View>
      <DownloadComponent uploadedDocId={loanAgreementId} />
      <CheckBox
        checked={props.value && props.value === 'Yes' ? true : false}
        style={{ marginTop: 5 }}
        onChange={(checked) => props.onChange(checked ? 'Yes' : undefined)}
      >
        {translations['loan.agreement.consent.message']}
      </CheckBox>
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
    width: '100%'
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
})

export default LoanAgreementWidget
