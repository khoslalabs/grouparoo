import { useStyleSheet, StyleService, Text } from '@ui-kitten/components'
import React, { useEffect, useState } from 'react'

import { Linking, View, StyleSheet, Alert, Image } from 'react-native'



const AccountDetails = () => {

  const styles = useStyleSheet(themedStyles)

  return (
    <View>
      <View style={styles.container}>
        <View>
          <Text
            appearance="hint"
            category="label"
            style={{ paddingTop: 6, paddingRight: 5 }}
          >
            Account Holder Name:
          </Text>
        </View>
        <View>
          <Text appearance="default" category="h6">
            {"Name"}
          </Text>
        </View>
      </View>
      <View style={styles.container}>
        <View>
          <Text
            appearance="hint"
            category="label"
            style={{ paddingTop: 6, paddingRight: 5 }}
          >
            Bank Account Number:
          </Text>
        </View>
        <View>
          <Text appearance="default" category="h6">
             {"Account no"}
          </Text>
        </View>
      </View>
      <View style={styles.container}>
        <View>
          <Text
            appearance="hint"
            category="label"
            style={{ paddingTop: 6, paddingRight: 5 }}
          >
            IFSC Code:
          </Text>
        </View>
        <View>
          <Text appearance='default' category='h6'>{"IFSC code"}</Text>
        </View>
      </View>
    </View>
  );
};

const themedStyles = StyleService.create({
    rangeSelector: {
      marginTop: 16
    },
    container: {
      marginTop: 16,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start'
    }
  })
export default AccountDetails;
