import { CheckBox } from '@ui-kitten/components'
import React, { useContext, useState } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import DownloadComponent from '../common/DownloadComponent'
import { LocalizationContext } from '../../../../translation/Translation'
import { useSelector } from 'react-redux'
import PdfPreviewComponent from '../common/PdfPreviewComponent'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import LoadingSpinner from '../../../../../LoadingSpinner'
const resourceFactoryConstants = new ResourceFactoryConstants()
const LoanAgreementWidget = (props) => {
  const { translations } = useContext(LocalizationContext)
  const [show, setShow] = useState(true)
  const loanAgreementId = useSelector(state => state.loanApplications.applications[state.loanApplications.currentLoanApplicationId].loanAgreementId)
  const loanAgreentUrl = `${resourceFactoryConstants.constants.lending.downloadFile}${loanAgreementId}`
  return (
    <>
      <LoadingSpinner visible={show} />
      <View style={styles.container}>
        <PdfPreviewComponent agreementUrl={loanAgreentUrl} onLoadComplete={setShow} />
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
