import { Button, CheckBox, Spinner } from '@ui-kitten/components'
import React, { useContext } from 'react'
import { StyleSheet, Dimensions, View } from 'react-native'
import DownloadComponent from '../common/DownloadComponent'
import { LocalizationContext } from '../../../../translation/Translation'
import { useDispatch, useSelector } from 'react-redux'
import { useRequest } from 'ahooks'
import PdfPreviewComponent from '../common/PdfPreviewComponent'
import { config } from '../../../../../../../config'
const headers = {
  'X-Appwrite-Project': config.appWrite.projectId,
  'X-Appwrite-Key': config.appWrite.key,
  'Content-Type': 'application/pdf'
}

const getLoanAgreementUrl = async (dispatch) => {
  await dispatch.loans.getAllLoans()
}

const LoanAgreementWidget = (props) => {
  const dispatch = useDispatch()
  const { loading } = useRequest(() => getLoanAgreementUrl(dispatch))
  const { translations } = useContext(LocalizationContext)
  const loanAgreementUrl = useSelector(state => state.loanApplications.applications[state.loanApplications.currentLoanApplicationId].loanAgreementUrl)
  return (
    <>
      <View style={styles.container}>
        {loading && <Spinner />}
        <PdfPreviewComponent agreementUrl={loanAgreementUrl} />
      </View>
      <Button appearance='outline' style={{ marginTop: 6 }}>
        <DownloadComponent fileUrl={loanAgreementUrl} headers={headers} />
      </Button>
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
