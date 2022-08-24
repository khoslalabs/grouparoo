import { Select, SelectItem, Text } from '@ui-kitten/components'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import DocumentUploadComponent from '../../common/DocumentUploadComponent'
import DocumentPicker from 'react-native-document-picker'
import { brands, delears, getModelsArray } from './Data'
import isEmpty from 'lodash.isempty'
import { useRequest } from 'ahooks'

const VehicleDetailsField = (props) => {
  const dispatch = useDispatch()
  const filledData = props.formData
  console.log('filledData', filledData)
  const state = useSelector(state => state)
  const [selectBrandIndex, setSelectBrandIndex] = useState()
  const [selectModelIndex, setSelectModelIndex] = useState()
  const [selectDelearIndex, setSelectDelearIndex] = useState()
  const selectedBrand = brands[selectBrandIndex?.row] || filledData.brand
  const selectedDealr = delears[selectDelearIndex?.row] || filledData.dealer
  let models = []
  if (selectedBrand && selectedDealr) {
    models = getModelsArray(selectedBrand, selectedDealr)
  }
  const selectedModel = models[selectModelIndex?.row] || filledData.vehicleDetails
  const vehicleType = state?.formDetails?.vehicleType ? state?.formDetails?.vehicleType : 'New'

  const setSelectedVehicleModel = useRequest((data, dispatch) => {
    dispatch.formDetails.setSelectedVehicleModel(data)
    return data
  }, {
    manual: true,
    onSuccess: (data) => {
      props.onChange({ ...data, exShowroomPrice: parseInt(data.exShowroomPrice), margin: parseInt(data.margin) })
    }
  })
  useEffect(() => {
    if (!isEmpty(selectedModel)) {
      setSelectedVehicleModel.run(selectedModel, dispatch)
    }
  }, [selectedModel])
  return (
    <View>
      {vehicleType === 'New' &&
        <View>
          <Select
            selectedIndex={selectBrandIndex}
            value={selectedBrand}
            onSelect={index => setSelectBrandIndex(index)}
            label='Select Brand'
            placeholder='Select One...'
          >
            {brands.map((element, index) => {
              return (
                <SelectItem
                  key={index}
                  title={element}
                />
              )
            })}
          </Select>
          <Select
            selectedIndex={selectDelearIndex}
            onSelect={index => setSelectDelearIndex(index)}
            label='Select Delear'
            value={selectedDealr}
            placeholder='Select One...'
          >
            {delears.map((element, index) => {
              return (
                <SelectItem
                  key={index}
                  title={element}
                />
              )
            })}
          </Select>
          {models && models.length > 0 &&
            <Select
              selectedIndex={selectModelIndex}
              onSelect={index => setSelectModelIndex(index)}
              label='Select Model'
              value={!isEmpty(selectedModel) || !isEmpty(filledData) ? `${selectedModel?.model || filledData?.model}, ${selectedModel?.variation || filledData?.variation}` : 'Select One...'}
            >
              {models.map((element, index) => {
                return (
                  <SelectItem
                    key={index}
                    title={`${element?.model}, ${element?.variation}`}
                  />
                )
              })}
            </Select>}
          <View style={{ marginTop: 5 }}>
            <Text appearance='hint' category='label'>
              'Quotation/Proforma Invoice'
            </Text>
            <DocumentUploadComponent
              isUploadDone={false}
              onFileChange={(f) => console.log(f)}
              multiple
              files={[]}
              type={[DocumentPicker.types.pdf]}
              loading={false}
              selectText='Upload Qotation/Proforma Invoice'
              removeFile={() => { console.log() }}
              isAddMore={false}
              reset={false}
            />
          </View>
        </View>}
      {/* {vehicleType === 'Old' && <View>

       </View>} */}
    </View>
  )
}
export default VehicleDetailsField
