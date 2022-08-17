import React from 'react'
import { View, Linking } from 'react-native'
import {
  Text,
  StyleService,
  useStyleSheet,
  Button,
  List
} from '@ui-kitten/components'
import ScreenTitle from './ScreenTitle'
import styleConstants from '../styleConstants'
import { heightPercentageToDP } from 'react-native-responsive-screen'
const IntroductionScreenComponent = ({
  title,
  description,
  content,
  items,
  confirmText,
  onPress,
  disabled = false
}) => {
  const styles = useStyleSheet(themedStyles)
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <ScreenTitle
          title={title}
          description={description}
        />
        <Text category='s1' appearance='hint'>
          {content}
        </Text>
      </View>
    )
  }
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View>
          <item.Icon />
        </View>
        <View style={styles.itemDetailsContainer}>
          <Text category='h6'>{item.title}</Text>
          <Text category='p1' appearance='hint'>
            {item.description}
          </Text>
          {item.list && item.list.length > 0 && (
            <>
              {item.list.map((list, ix) => (
                <View style={styles.listItemRow} key={`help=list=${ix}`}>
                  <item.ListItemIcon />
                  <Text category='p2' style={styles.listItemText}>
                    {list}
                  </Text>
                </View>
              ))}
            </>
          )}
          {item.link && item.link.length > 0 && (
            <View style={styles.linkTextStyle}>
              <Text
                status='info'
                category='p1'
                onPress={() => Linking.openURL(item.link)}
              >
                {item.linkText}
              </Text>
            </View>
          )}
        </View>
      </View>
    )
  }
  const renderFooter = () => {
    return (
      <View>
        <Button onPress={onPress} disabled={disabled}>
          {confirmText}
        </Button>
      </View>
    )
  }
  return (
    <List
      contentContainerStyle={styles.contentContainer}
      data={items}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsHorizontalScrollIndicator={false}
      ListFooterComponentStyle={styles.footer}
      showsVerticalScrollIndicator={false}
    />
  )
}

const themedStyles = StyleService.create({
  headerContainer: {
    marginBottom: 16
  },
  itemDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justyContent: 'flex-start',
    paddingLeft: 8,
    flexWrap: 'wrap',
    width: '95%'
  },
  contentContainer: {
    backgroundColor: 'background-basic-color-1',
    minHeight: heightPercentageToDP('93%')
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: 8,
    marginLeft: 8
  },
  content: {
    ...styleConstants.content
  },
  bottomButtonContainer: {
    paddingVertical: 8
  },
  listItemRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    jistifyContent: 'flex-start',
    marginVertical: 4
  },
  listItemText: {
    paddingHorizontal: 4
  },
  footer: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'flex-end',
    marginBottom: 16
  },
  linkTextStyle: {
    marginTop: 8,
    underline: { textDecorationLine: 'underline' }
  }
})

export default IntroductionScreenComponent
