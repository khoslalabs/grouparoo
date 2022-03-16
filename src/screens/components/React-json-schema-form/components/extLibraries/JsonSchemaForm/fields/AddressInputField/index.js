import React, {
  useContext,
  useEffect,
  useState
} from 'react'
import isEmpty from 'lodash.isempty'
import isUndefined from 'lodash.isundefined'
import { useRequest } from 'ahooks'
import { useSelector, useDispatch } from 'react-redux'
import BodyHeaderService from '../../../../../services/BodyHeaderService'
import ResourceFactoryConstants from '../../../../../services/ResourceFactoryConstants'
import DataService from '../../../../../services/DataService'
import {
  IndexPath,
  Input,
  Select,
  SelectItem,
  Text,
  Spinner,
  CheckBox
} from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import { LocalizationContext } from '../../../../../translation/Translation'
import MaskedInput from '../../../textMask/text-input-mask'
import ReactJsonSchemaUtil from '../../../../../services/ReactJsonSchemaFormUtil'
import { transformData } from './addressUtils'
import AddressDisplay from './AddressDisplay'
const INDIA_COUNTRY_CODE = 'IN'
const validatePincode = async (pinCode) => {
  try {
    const res = await ReactJsonSchemaUtil.pinCodeValidity(pinCode.replace(/ /g, ''))
    const data = res.data
    if (data.status === 'success' && data.isPincodeValid === 'true') {
      return pinCode
    } else {
      throw new Error('CANNOT_VALIDATE_PINCODE')
    }
  } catch (err) {
    if (err.message === 'CANNOT_VALIDATE_PINCODE') {
      throw err
    } else {
      throw new Error('CANNOT_ACCESS_PNCODE_DB')
    }
  }
}
const getRequestData = (levelcode, templatecode, elementcode) => {
  return {
    template_code: String(templatecode),
    level_code: levelcode,
    element_code: String(elementcode)
  }
}

const loadCities = async (dispatch, authToken, stateCode) => {
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const requestBodyHeaders = new BodyHeaderService()
  const requestBody = {}
  requestBody.headers = requestBodyHeaders.getRequestBodyHeaders()
  requestBody.request = getRequestData('STATE', 'IN', stateCode)
  try {
    const response = await DataService.postDataV1(
      resourceFactoryConstants.constants.masterData.getStates,
      requestBody,
      {
        headers: {
          Authorization: authToken
        }
      }
    )
    const data = response.data
    if (data?.response_status?.status === 'SUCCESS') {
      dispatch.cache.setCity({
        stateCode,
        cities: data.hierarchy_elements[0].elements
      })
    } else {
      console.log(data.response_status.message)
      throw new Error('CANNOT_FETCH_CITIES_DATA')
    }
  } catch (e) {
    console.log(e)
    if (e.message === 'CANNOT_FETCH_STATE_DATA') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_ADDRESS_SERVER')
    }
  }
}

const loadStates = async (dispatch, authToken) => {
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const requestBodyHeaders = new BodyHeaderService()
  const requestBody = {}
  requestBody.headers = requestBodyHeaders.getRequestBodyHeaders()
  requestBody.request = getRequestData('COUNTRY', INDIA_COUNTRY_CODE, INDIA_COUNTRY_CODE)
  try {
    const response = await DataService.postDataV1(
      resourceFactoryConstants.constants.masterData.getStates,
      requestBody,
      {
        headers: {
          Authorization: authToken
        }
      }
    )
    const data = response.data
    if (data?.response_status?.status === 'SUCCESS') {
      dispatch.cache.setState(
        data.hierarchy_elements[0].elements
      )
    } else {
      console.log(data.response_status.message)
      throw new Error('CANNOT_FETCH_STATE_DATA')
    }
  } catch (e) {
    console.log(e)
    if (e.message === 'CANNOT_FETCH_STATE_DATA') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_ADDRESS_SERVER')
    }
  }
}
const ZIP_LENGTH = 6
const AddressInputField = (props) => {
  const isRequired = props?.schema?.required?.length > 0
  const { states, allCities, udyamData, gstnData, authToken } = useSelector((state) => ({
    states: state?.cache?.state,
    allCities: state?.cache?.city,
    udyamData: state.formDetails.udyamData,
    gstnData: state.formDetails.gstnData,
    authToken: state.cache.authToken
  }))
  const { translations } = useContext(LocalizationContext)

  const udyamAddress = transformData(udyamData, 'udyam', translations['address.source.udyam'])
  const gstnAddress = transformData(gstnData, 'gstn', translations['address.source.gstn'])
  const addresses = [...udyamAddress, ...gstnAddress]
  const dispatch = useDispatch()
  const [isFormValid, setIsValid] = useState(true)
  const [address, setAddress] = useState({
    address1: '',
    address2: '',
    landmark: '',
    country: INDIA_COUNTRY_CODE,
    state: '',
    city: '',
    zipCode: ''
  })
  const [selectedStateIndex, setSelectedStateIndex] = useState()
  const [selectedCityIndex, setSelectedCityIndex] = useState()
  const [isOwnAddress, setIsOwnAddress] = useState(!isEmpty(props?.formData) ? (!props?.formData?.source) : false)
  let cities = []
  if (address.stateCode && address.stateCode.length > 0) {
    cities = allCities[address.stateCode] ? allCities[address.stateCode] : cities
  }
  const useLoadStates = useRequest(() => loadStates(dispatch, authToken), {
    onSuccess: () => { },
    onError: () => { },
    refreshDeps: [states.length === 0]
  })
  const useValidatePincode = useRequest(validatePincode, {
    manual: true,
    onSuccess: (result) => {
      updateAddress('zipCode', result)
    },
    onError: () => {
      props.onChange(null)
    }
  })
  useEffect(() => {
    if (!useLoadCities.loading) {
      if (!isUndefined(address.stateCode)) {
        useLoadCities.run(dispatch, authToken, address.stateCode)
      }
    }
  }, [selectedStateIndex])
  const useLoadCities = useRequest(loadCities, {
    onSuccess: () => { },
    onError: () => { },
    manual: true
  })

  const isValid = (addressObj) => {
    return (
      !isEmpty(addressObj.address1) &&
      !isEmpty(addressObj.country) &&
      !isEmpty(addressObj.state) &&
      !isEmpty(addressObj.city) &&
      !isEmpty(addressObj.zipCode) &&
      (addressObj.zipCode.length === ZIP_LENGTH)
    )
  }

  useEffect(() => {
    /** Validation */
    if (
      !isEmpty(props.errorSchema) ||
      !isEmpty(props.rawErrors) ||
      (props.formData &&
        Object.keys(props.formData).length > 0 &&
        !isValid(props.formData))
    ) {
      setIsValid(false)
    } else {
      setIsValid(true)
      if (props.formData && !isEmpty(props.formData)) {
        setAddress(props.formData)
      }
    }
  }, [props.errorSchema, props.rawErrors])

  const updateAddress = (newData) => {
    const newAddress = Object.assign({}, address, newData)
    if (isValid(newAddress)) {
      // checking if 'source' keyword is there or not
      if (Object.prototype.hasOwnProperty.call(newAddress, 'source')) {
        delete newAddress.source
      }
      props.onChange(newAddress)
    } else {
      if (isRequired) {
        props.onChange(null)
      } else {
        props.onChange(undefined)
      }
    }
    setAddress(newAddress)
  }
  const onStateChangeHandler = (data) => {
    setSelectedStateIndex(new IndexPath(data.row))
    updateAddress({
      stateCode: states[data.row].element_code,
      state: states[data.row].element_name
    })
  }
  const onCityChangeHandler = (data) => {
    setSelectedCityIndex(new IndexPath(data.row))
    updateAddress({
      city: cities[data.row].element_name,
      cityCode: cities[data.row].element_code
    })
  }
  const onPincodeChangeHandler = (pinCode) => {
    updateAddress({
      zipCode: pinCode
    })
  }
  const setSelectedAddress = (address) => {
    const newAddress = Object.assign({}, address, { country: INDIA_COUNTRY_CODE })
    props.onChange(newAddress)
  }
  const accesoryState = () => {
    if (useLoadStates.loading) {
      return (<Spinner size='small' />)
    }
    return null
  }
  return (
    <View>
      {addresses.length > 0 && !isOwnAddress && (
        <>
          <View>
            <View style={styles.selectTextContainer}>
              <Text category='s1' status='info'>
                {translations['address.source.content']}
              </Text>
            </View>
            {
              addresses.map((ua, ix) => (
                <AddressDisplay
                  key={`address-display-${ix}`}
                  {...ua}
                  onSelectAddress={setSelectedAddress}
                  selected={props?.formData && props?.formData?.source === ua?.source}
                />
              ))
            }
          </View>
          <View style={styles.selectTextContainer}>
            <CheckBox onChange={setIsOwnAddress} checked={isOwnAddress}>
              <Text category='s1' status='default'>
                {translations['address.addnew']}
              </Text>
            </CheckBox>
          </View>
        </>
      )}
      {(isOwnAddress || addresses.length === 0) && (
        <>
          <View style={styles.rowMargin}>
            <Input
              label={translations['address.addressLine1']}
              onChangeText={(address1) => updateAddress({ address1 })}
              value={address.address1}
              status={!isFormValid && 'danger'}
            />
          </View>
          <View style={styles.rowMargin}>
            <Input
              label={translations['address.addressLine2']}
              status='basic'
              onChangeText={(address2) => updateAddress({ address2 })}
              value={address.address2}
            />
          </View>
          <View style={styles.rowMargin}>
            <Input
              label={translations['address.landmark']}
              status='basic'
              onChangeText={(landmark) => updateAddress({ landmark })}
              value={address.landmark}
            />
          </View>
          <View style={styles.rowMargin}>
            <Select
              label={translations['address.selectstate']}
              selectedIndex={selectedStateIndex}
              value={address.state}
              onSelect={onStateChangeHandler}
              status={!isFormValid && 'danger'}
              accessoryLeft={accesoryState}
            >
              {states.map((element, index) => {
                return (
                  <SelectItem
                    key={element.element_code}
                    title={element.element_name}
                  />
                )
              })}
            </Select>
          </View>
          <View style={styles.rowMargin}>
            <Select
              label={translations['address.selectcity']}
              selectedIndex={selectedCityIndex}
              value={address.city}
              onSelect={onCityChangeHandler}
              status={!isFormValid && 'danger'}
              accessoryLeft={() => useLoadCities.loading && <Spinner size='small' />}
            >
              {cities.map((element, index) => {
                return (
                  <SelectItem
                    key={element.element_code}
                    title={element.element_name}
                  />
                )
              })}
            </Select>
          </View>
          <View style={styles.rowMargin}>
            <MaskedInput
              type='zip-code'
              includeRawValueInChangeText
              keyboardType='numeric'
              label={translations['address.pincode']}
              value={address.zipCode}
              onChangeText={(newText, rawText) => onPincodeChangeHandler(rawText)}
              status={!isFormValid && 'danger'}
              accessoryRight={() => useValidatePincode.loading && <Spinner size='small' />}
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  rowMargin: {
    marginVertical: 4
  },
  selectTextContainer: {
    marginVertical: 4
  }
})
export default AddressInputField
