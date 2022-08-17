import React, { useContext } from 'react'
import { useStore, useSelector, useDispatch } from 'react-redux'
import { View } from 'react-native'
import { useRequest } from 'ahooks'
import { List, Text, StyleService, useStyleSheet } from '@ui-kitten/components'
import styleConstants from '../styleConstants'
import { LocalizationContext } from '../../components/Translation'
import SimpleCard from '../components/SimpleCard'
import HorizontalListOffer from '../components/HorizontalListOffers'
import RepaymentCard from '../components/RepaymentCard'
import NextEmiCard from '../components/NextEmiCard'
import PendingLoanApplications from '../components/PendingLoanApplications'
import MyLoansCard from '../components/MyLoansCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { AllIcons } from '../components/ThemedIcons'
import ScreenTitle from '../components/ScreenTitle'
const HomeListComponents = {
  SimpleCard,
  RepaymentCard,
  NextEmiCard,
  PendingLoanApplications,
  MyLoansCard
}
const getHomeData = async (dispatch) => {
  await dispatch.loans.getAllLoans()
}

const HomeScreen = ({ navigation, route }) => {
  const store = useStore()
  const dispatch = useDispatch()
  const state = useSelector(state => state)
  const { loading } = useRequest(() => getHomeData(dispatch))
  const selection = store.select(models => ({
    customer: models.customer.getCustomer,
    loans: models.loans.getActiveLoans,
    loanApplications: models.loanApplications.getActiveLoanApplications,
    homeListItems: models.homeListItems.getHomeListItems
  }))

  const { loans, loanApplications, customer, homeListItems } = selection(state)

  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)

  if (loading) {
    return <LoadingSpinner />
  }
  const localeText = {
    hello: translations.formatString(translations['hello!'], customer),
    subHeading: translations['app.title']
  }
  const processPayment = (loanId, amount) => {
    navigation.navigate('Payments', { loanId, amount })
  }
  const renderHeader = () => (
    <ScreenTitle
      title={localeText.hello}
      description={localeText.subHeading}
    />
  )

  const renderVerticalItems = ({ item }) => {
    const Component = HomeListComponents[item.component]
    if (item.name === 'MyLoans') {
      if (loans.length > 0) {
        return loans.map((loan, ix) => (
          <View style={styles.componentStyle} key={`myloanscard-${ix}`}>
            <Component
              loanId={loan.loanApplicationId}
              Icon={AllIcons[item.icon]}
              onPress={() => item.onPress(item, { loanId: loan.loanId })}
              heading={item.heading}
            />
          </View>
        ))
      }
    } else if (item.name === 'PendingApplications') {
      if (loanApplications.length > 0) {
        return loanApplications.map((loanApplication, ix) => (
          <View style={styles.componentStyle} key={`pendingapplication-${ix}`}>

            <Component
              loanApplicationId={loanApplication.loanApplicationId}
              Icon={AllIcons[item.icon]}
              onPress={() => item.onPress(item, { loanApplicationId: loanApplication.loanApplicationId, isAgreement: true })}
              heading={item.heading}
            />
          </View>
        ))
      }
    } else if (item.name === 'RepaymentsPending') {
      if (loans.length > 0) {
        return loans.map((loan, ix) => (
          <View style={styles.componentStyle} key={`repayment-${ix}`}>
            <Component
              loanId={loan.loanApplicationId}
              onPress={() => item.onPress(item, { loanId: loan.loanId })}
              onPaymentPress={processPayment}
              Icon={AllIcons[item.icon]}
              heading={item.heading}
            />
          </View>

        ))
      }
    } else if (item.name === 'NextEmi') {
      if (loans.length > 0) {
        return loans.map((loan, ix) => (
          <View style={styles.componentStyle} key={`nextemi-${ix}`}>
            <Component
              loanId={loan.loanApplicationId}
              key={`nextemi-${ix}`}
              onPress={() => item.onPress(item, { loanId: loan.loanId })}
              onPaymentPress={processPayment}
              Icon={AllIcons[item.icon]}
              heading={item.heading}
            />
          </View>

        ))
      }
    } else if (item.name === 'Offers') {
      return <HorizontalListOffer />
    }
  }

  const handleOnPress = (item, params) => {
    if (item.name === 'RepaymentsPending') {
      navigation.navigate('Repayments', params)
    } else if (item.name === 'PendingApplications') {
      // navigation.navigate('ApplicationForm', params) // TODO: Will Fix it Later, it will not go to ApplicationForm, It is already done
    } else if (item.name === 'MyLoans') {
      navigation.navigate('MyLoans', params)
    } else if (item.name === 'NextEmi') {
      navigation.navigate('MyLoans', params)
    }
  }
  homeListItems.forEach(hl => {
    hl.onPress = handleOnPress
  })

  return (
    <List
      style={styles.container}
      contentContainerStyle={styles.list}
      data={homeListItems}
      renderItem={renderVerticalItems}
      ListHeaderComponent={renderHeader}
      showsVerticalScrollIndicator={false}
    />
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1
  },
  list: {
    // flexDirection: 'column',
    // alignItems: 'flex-start',
    // justifyContent: 'flex-start',
    // height: 'auto',
    // marginTop: 'auto'
  },
  componentStyle: {
    marginBottom: 4
  },
  heading: {
    ...styleConstants.heading
  },
  subHeading: {
    ...styleConstants.subHeading
  },
  section: {
    ...styleConstants.section,
    flexDirection: 'column'
  }
})

export default HomeScreen
