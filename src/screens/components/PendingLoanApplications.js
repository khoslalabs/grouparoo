import React, { useContext } from 'react'
import { View } from 'react-native'
import { useStore, useSelector } from 'react-redux'
import { Card, Text, StyleService, useStyleSheet, Button } from '@ui-kitten/components'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import VerticalStepIndicator from '../components/VerticalStepIndicator'
import { LocalizationContext } from '../../components/Translation'
import styleConstants from '../styleConstants'
const Loading = () => (
  <Placeholder
    Animation={Fade}
    Left={PlaceholderMedia}
    Right={PlaceholderMedia}
  >
    <PlaceholderLine width={80} />
    <PlaceholderLine />
    <PlaceholderLine width={30} />
    <PlaceholderLine width={30} />
  </Placeholder>
)

const PendingLoanApplications = ({
  heading,
  loanApplicationId,
  Icon,
  onPress,
  loading
}) => {
  if (loading) {
    return <Loading />
  }
  const store = useStore()
  const state = useSelector(state => state)
  const selector = store.select(models => ({
    loanApplicationSteps: models.loanApplicationSteps.getLoanApplicationSteps,
    currentStep: models.loanApplicationSteps.getCurrentStep
  }))
  const { loanApplicationSteps, currentStep } = selector(state, {
    loanApplicationId
  })

  // FIXME: Remove this
  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)
  return (
    <Card style={styles.cardContainer} onPress={onPress}>
      <View style={styles.cardTitleContainer}>
        <View style={styles.cardTitleContainer}>
          <Icon />
          <Text
            style={styles.heading}
            category='h6'
            status='primary'
            appearance='default'
          >
            {translations[heading]}
          </Text>
        </View>
      </View>
      <VerticalStepIndicator
        stepData={loanApplicationSteps}
        currentStep={currentStep.index}
        onPress={onPress}
        loanApplicationId={loanApplicationId}
      />
      {/* <Button onPress={onPress}>
        {translations['pendingLoanApplication.viewDetails']}
      </Button> */} 
      {/* TODO: Need to fix, button. We can't show form to do agreement */}
    </Card>
  )
}

const themedStyles = StyleService.create({
  cardContainer: {
    ...styleConstants.cardContainer
  },
  headRow: {
    marginBottom: 12
  },
  cardTitleContainer: {
    ...styleConstants.cardTitleContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  contentContainer: {
    ...styleConstants.contentContainer,
    flexDirection: 'row'
  },
  heading: {
    ...styleConstants.heading
  },
  headingAmount: {
    marginLeft: 'auto'
  },
  content: {
    ...styleConstants.content,
    width: 100
  },
  repaymentSchedule: {
    flexDirection: 'column',
    alignItems: 'baseline'
  },
  scheduleRowHead: {
    flexDirection: 'row',
    marginBottom: 4
  },

  scheduleRow: {
    flexDirection: 'row'
  },
  payNow: {
    marginLeft: 'auto',
    width: 150
  }
})

export default PendingLoanApplications
