import { Text, useStyleSheet, StyleService, Card } from '@ui-kitten/components'
import React, { useContext } from 'react'
import ScreenTitle from '../components/ScreenTitle'
import { View, Image, Linking } from 'react-native'
import { LocalizationContext } from '../../components/Translation'
import { TouchableOpacity } from 'react-native-gesture-handler'
const LendingPartners = ({ navigation, route }) => {
  const styles = useStyleSheet(themedStyles)
  const { translations } = useContext(LocalizationContext)
  const title = route.params?.title
  return (
    <>
      <ScreenTitle title={title} />
      <Card style={styles.partnersContainer}>
        <Image source={require('../../assets/images/Arthmatelogopng.png')} resizeMode='center' style={styles.image} />
        <View style={styles.row}>
          <View>
            <Text category='c1' appearance='hint'>{translations['lending.partner.terms']}: </Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.arthmate.com/t-n-p')}><Text category='c2' status='success'>https://www.arthmate.com/t-n-p</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          <Text category='c1' appearance='hint'>{translations['lending.partner.email']}: </Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:statutory.compliance@arthmate.com')}><Text category='c2' status='success'>statutory.compliance@arthmate.com </Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text category='c1' appearance='hint'>{translations['lending.partner.help.desk']}: </Text>
          <Text category='c2' appearance='default'>+91 73021186677</Text>
        </View>
      </Card>
    </>
  )
}

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  partnersContainer: {
    marginTop: 10
  },
  image: {
    height: 50,
    width: 200
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5
  }
})

export default LendingPartners
