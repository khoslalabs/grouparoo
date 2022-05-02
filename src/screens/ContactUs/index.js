import { Text, useStyleSheet, StyleService, Card } from '@ui-kitten/components'
import React, { useContext } from 'react'
import ScreenTitle from '../components/ScreenTitle'
import { View, Linking } from 'react-native'
import { LocalizationContext } from '../../components/Translation'
import { TouchableOpacity } from 'react-native-gesture-handler'

const ContactUs = (props) => {
  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)
  const title = props.route.params?.title
  return (
    <>
      <ScreenTitle title={title} description={translations['lending.contact.us.description']} />
      <Card style={styles.partnersContainer}>
        <View style={styles.rowDesign}>
          <View>
            <Text category='p1' appearance='hint'>{translations['lending.contact.us.email']}: </Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:care@novopay.in')}><Text category='s1' status='success' style={styles.valueText} >care@novopay.in</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.line} />
        <View style={styles.rowDesign}>
          <View>
            <Text category='p1' appearance='hint'>{translations['lending.contact.us.mobile']}: </Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+918067778666')}><Text category='s1' status='success' style={styles.valueText} >+91 8067778666</Text></TouchableOpacity>
          </View>
        </View>
      </Card>
    </>
  )
}
const themedStyles = StyleService.create({
  valueText: {
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  partnersContainer: {
    marginTop: 0
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5
  },
  rowDesign: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  line: {
    marginTop: 10,
    borderBottomColor: '#F0F0FF',
    borderBottomWidth: 1
  }
})

export default ContactUs
