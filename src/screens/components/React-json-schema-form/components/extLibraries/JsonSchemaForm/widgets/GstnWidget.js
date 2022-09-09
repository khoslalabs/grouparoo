import React, { useState, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useRequest } from 'ahooks'
import Toast from 'react-native-toast-message'
import isEmpty from 'lodash.isempty'

import MaskedInput from '../../textMask/text-input-mask'
import { useFormContext } from '../FormContext'
import { Spinner } from '@ui-kitten/components'
import { LocalizationContext } from '../../../../translation/Translation'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import DataService from '../../../../services/DataService'
import IconUtil from '../../../common/IconUtil'

const validateGstn = async (dispatch, gstin) => {
  const resourseFactoryConstants = new ResourceFactoryConstants()
  const url = `${resourseFactoryConstants.constants.gstin.verifyGstin}${gstin.toUpperCase()}`
  try {
    const res = await DataService.getData(url)
    const response = res?.data
    if (response.status === 'SUCCESS') {
      await Promise.all([
        dispatch.formDetails.setGstnData(response.data),
        dispatch.formDetails.setIsGSTVerified('Yes')
      ])
      return { success: true }
    } else {
      console.log(response.message)
      throw new Error('INVALID_GSTN_ENTERED')
    }
  } catch (e) {
    if (e.message === 'INVALID_GSTN_ENTERED') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_GSTN_VALIDATION_SERVER')
    }
  }
}

const GstnWidget = ({
  id,
  readonly,
  disabled,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  autofocus,
  options,
  multiline,
  secureEntry,
  placeholder,
  schema,
  textContentType = 'none',
  rawErrors = [],
  required
}) => {
  const { theme } = useFormContext()
  const hasErrors = rawErrors.length > 0
  const { translations } = useContext(LocalizationContext)
  const [gstin, setGstin] = useState(value || '')
  const [invalid, setInvalid] = useState(false)
  const dispatch = useDispatch()
  const useValidateGstn = useRequest(validateGstn, {
    manual: true,
    onError: (error) => {
      setInvalid(true)
      onChange(undefined)
      if (error.message === 'CANNOT_REACH_GSTN_VALIDATION_SERVER') {
        throw error
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['gstn.title'],
            description: translations['gstn.failed']
          }
        })
      }
    },
    onSuccess: () => {
      setInvalid(false)
      onChange(gstin)
      Toast.show({
        type: 'success',
        position: 'bottom',
        visibilityTime: 2000,
        props: {
          title: translations['gstn.title'],
          description: translations['gstn.success']
        }
      })
    }
  })
  const getTickMark = () => {
    if (!value) {
      if (useValidateGstn.loading) {
        return (<Spinner />)
      } else if (invalid) {
        return <IconUtil.ErrorIcon />
      } else {
        return null
      }
    } else {
      return (
        <IconUtil.CheckIcon />
      )
    }
  }

  // const onBlurTextHandler = () => {
  //   if (isEmpty(gstin) || (gstin && gstin.length !== 15)) {
  //     return
  //   }
  //   useValidateGstn.run(dispatch, gstin)
  // }

  const onGstnChangeHandler = (gstn) => {
    setGstin(gstn);
    if (isEmpty(gstn) || (gstn && gstn.length !== 15)) {
      return
    }
    useValidateGstn.run(dispatch, gstn)
  };

  return (
    <>
      <MaskedInput
        type='custom'
        options={{
          mask: '99AAAAA9999A9AA'
        }}
        includeRawValueInChangeText
        multiline={multiline}
        placeholder={placeholder || '12XXXXX1234X1XX'}
        autoFocus={autofocus}
        editable={!disabled && !readonly}
        keyboardType='visible-password'
        value={gstin}
        secureTextEntry={secureEntry}
        textContentType={textContentType}
        onChangeText={(_, rawText) => onGstnChangeHandler(rawText)}
        // onBlur={onBlurTextHandler}
        onFocus={() => {
          onFocus(id, value)
        }}
        selectionColor={theme.highlightColor}
        placeholderTextColor={theme.placeholderTextColor}
        status={hasErrors && 'danger'}
        accessoryRight={() => getTickMark()}
      />
    </>
  )
}

export default GstnWidget
