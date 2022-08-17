import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@ui-kitten/components'
import TitleField from './TitleField'
import DescriptionField from './DescriptionField'
import { useFormContext } from '../FormContext'
import { LocalizationContext } from '../../../../translation/Translation'

const FieldTemplate = ({
  label,
  children,
  displayLabel,
  rawErrors = [],
  rawHelp,
  required,
  rawDescription
}) => {
  const { theme } = useFormContext()
  const hasErrors = rawErrors?.length > 0
  const { translations } = useContext(LocalizationContext)
  return (
    <View style={styles.container}>
      {displayLabel && label ? (
        <TitleField title={label} required={required} hasErrors={hasErrors} />
      ) : null}
      {children}
      {displayLabel && rawDescription ? (
        <DescriptionField description={rawDescription} />
      ) : null}
      {hasErrors &&
        rawErrors.map((error, i) => (
          <Text
            key={i}
            style={[
              styles.description,
              styles.error,
              { color: theme.errorColor }
            ]}
          >
            {translations[error] || error}
          </Text>
        ))}
      {rawHelp?.length > 0 && <Text category='c1' appearence='hint' status='info'>{rawHelp}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  error: {
    marginTop: 5
  }
})

export default FieldTemplate
