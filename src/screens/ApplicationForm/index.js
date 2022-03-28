import React, { useContext } from 'react'
import { useSelector, useDispatch, useStore } from 'react-redux'
import {
  TopNavigation,
  TopNavigationAction,
  StyleService,
  useStyleSheet,
  Icon
} from '@ui-kitten/components'
import { BackHandler } from 'react-native'
import isUndefined from 'lodash.isundefined'
import ApplicationFormNative from './ApplicationFormNative'
import { WarningIcon } from '../components/ThemedIcons'
import { LocalizationContext } from '../../components/Translation'
import SimpleModal from '../components/SimpleModal'
import LoanApplicationHelp from './LoanApplicationHelp'
import ApplicationStage from './ApplicationStage'
import { config } from '../../config'
const ApplicationForm = ({ navigation, route }) => {
  let loanApplicationId = route.params?.loanApplicationId
  const dispatch = useDispatch()
  const store = useStore()
  const styles = useStyleSheet(themedStyles)
  const state = useSelector(state => state)
  const [visible, setVisible] = React.useState(false)
  const { translations } = useContext(LocalizationContext)
  let currentLoanApplication
  if (loanApplicationId) {
    currentLoanApplication = store.select.loanApplications.getApplicationById(state, loanApplicationId)
  } else {
    currentLoanApplication = store.select.loanApplications.getCurrentLoanApplication(state)
    loanApplicationId = currentLoanApplication?.loanApplicationId
  }
  const loanApplicationStage = store.select.loanApplications.getLoanApplicationStage(state, { loanApplicationId })
  const isCpv = loanApplicationStage?.progress === config.LOAN_APP_PROGRESS_COMPLETE && loanApplicationStage?.processState === config.APP_STAGE_CPV_INITIATED
  const isAgreement = loanApplicationStage?.progress === config.LOAN_APP_PROGRESS_COMPLETE && loanApplicationStage?.processState === config.APP_STAGE_CPV_COMPLETE
  const isHelpShown = store.select.settings.getIsApplicationHelpShown(state)
  const isAgreementHelpShown = store.select.settings.getIsAgreementHelpShown(state)
  const showApplicationForm = (isHelpShown && !isAgreement) || (isAgreement && isAgreementHelpShown)

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
  )
  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
  )
  const navigateBack = () => {
    // props.navigation.goBack()
  }
  const exitApp = () => {
    BackHandler.exitApp()
  }
  const onPress = () => {
    dispatch.settings.setApplicationHelpShown(true)
  }
  const onPressAgeement = () => {
    dispatch.settings.setAgreementHelpShown(true)
  }
  if ((isCpv || isAgreement) && !isAgreementHelpShown) {
    return (
      <ApplicationStage
        loanApplicationId={loanApplicationId}
        enable={isAgreement}
        onPress={onPressAgeement}
      />
    )
  }
  if (!isUndefined(currentLoanApplication)) {
    return (
      <>
        <TopNavigation
          style={styles.topNavigationStyle}
          alignment='center'
          accessoryLeft={BackAction}
        />
        {/* If Agreement is enabled, no need to show loan Application Help */}
        {!isHelpShown && !isAgreement && (<LoanApplicationHelp onPress={onPress} />)}
        {showApplicationForm && (
          <ApplicationFormNative
            currentLoanApplication={currentLoanApplication}
            isAgreement={isAgreement}
          />
        )}
        <SimpleModal
          visible={visible}
          okText={translations['modal.ok']}
          cancelText={translations['modal.cancel']}
          onCancel={() => setVisible(false)}
          onOk={exitApp}
          title={translations['applicationForm.exitConfirmation.title']}
          description={translations['applicationForm.exitConfirmation.description']}
          subTitle={translations['applicationForm.exitConfirmation.subTitle']}
          Icon={WarningIcon}
        />
      </>
    )
  } else {
    throw new Error('NO_CURRENT_LOAN_APPLICATION')
  }
}
const themedStyles = StyleService.create({
  topNavigationStyle: {
    backgroundColor: 'background-basic-color-1'
  }
})
export default ApplicationForm
