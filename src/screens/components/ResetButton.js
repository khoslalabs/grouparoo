import React, { useState, useContext } from 'react'
import { useCountDown } from 'ahooks'
import { StyleService, useStyleSheet } from '@ui-kitten/components'
import SpinnerButton from '../components/SpinnerButton'
import { LocalizationContext } from '../../components/Translation'

const ResetButton = ({ startTime, sleepTime, loading, resendOtp }) => {
  const { translations } = useContext(LocalizationContext)
  const styles = useStyleSheet(themedStyles)
  const [countdown, formattedRes] = useCountDown({
    targetDate: startTime + sleepTime
  })
  const disabled = (countdown !== 0)
  return (
    <SpinnerButton
      style={styles.actionButton}
      loading={loading}
      appearance='outline'
      disabled={disabled || loading}
      status='primary'
      size='tiny'
      onPress={resendOtp}
    >
      {disabled === true &&
        translations.formatString(translations['otp.waitingFor'], {
          waitSecondsStr: formattedRes.seconds
        })}
      {disabled === false && translations['otp.resend']}
    </SpinnerButton>
  )
}
const themedStyles = StyleService.create({
  actionButton: {
    marginHorizontal: 16,
    borderRadius: 16
  }
})

export default ResetButton
