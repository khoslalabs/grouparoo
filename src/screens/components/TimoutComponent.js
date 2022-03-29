import React, { useContext } from 'react'
import { useCountDown } from 'ahooks'
import { Text } from '@ui-kitten/components'
import { LocalizationContext } from '../../components/Translation'

const TimeoutComponent = ({
  validWindow,
  startTime
}) => {
  const { translations } = useContext(LocalizationContext)
  const [countdown, formattedRes] = useCountDown({
    targetDate: startTime + validWindow
  })
  console.log(countdown)
  const isTimeout = (countdown === 0)
  return (
    <Text category='c1' status='primary'>
      {isTimeout === false &&
        translations.formatString(
          translations['otp.otpTimer'],
          { minutes: formattedRes.minutes, seconds: formattedRes.seconds }
        )}
      {isTimeout === true && translations['otp.otpTimeout']}
    </Text>
  )
}
export default TimeoutComponent
