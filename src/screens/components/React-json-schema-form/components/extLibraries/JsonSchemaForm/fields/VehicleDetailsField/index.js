import { Select, SelectItem, Text } from '@ui-kitten/components'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import DocumentUploadComponent from '../../common/DocumentUploadComponent'
import DocumentPicker from 'react-native-document-picker'

const VehicleDetailsField = (props) => {
  console.log(props)
  const state = useSelector(state => state)
  const [selectBrandIndex, setSelectBrandIndex] = useState()
  const [selectModelIndex, setSelectModelIndex] = useState()
  const [selectDelearIndex, setSelectDelearIndex] = useState()
  const brands = ['Hero', 'Bajaj']
  const models = ['Splendor Plus, Self with Alloy Wheel', 'Splendor Plus, Black and Accent', 'Splendor Plus, Self with Alloy Wheel and i3S', 'Pulsar, NS 200', 'Pulsar, 125Neon', 'Pulsar, 150']
  const delears = ['RT Krishna', 'Nidhi Motors', 'SS Motors', 'Anant Bajaj', 'Amba Bajaj']
  const selectedBrand = brands[selectBrandIndex?.row]
  const selectedModels = models[selectModelIndex?.row]
  const selectedDealrs = delears[selectDelearIndex?.row]
  const vehicleType = state?.formDetails?.vehicleType ? state?.formDetails?.vehicleType : 'New'
  useEffect(() => {
    props.onChange(
      {
        brand: 'Hero',
        model: 'Splendor Plus',
        variation: 'Self with Alloy Wheel',
        dealer: 'RT Krishna',
        pinCode: '560035',
        exShowroomPrice: 70408,
        Margin: 10
      }
    )
  }, [])
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
            <SelectItem title='Hero' />
            <SelectItem title='Bajaj' />
          </Select>
          <Select
            selectedIndex={selectModelIndex}
            onSelect={index => setSelectModelIndex(index)}
            label='Select Model'
            value={selectedModels}
            placeholder='Select One...'
          >
            <SelectItem title='Splendor Plus, Self with Alloy Wheel' />
            <SelectItem title='Splendor Plus, Black and Accent' />
            <SelectItem title='Splendor Plus, Self with Alloy Wheel and i3S' />
            <SelectItem title='Pulsar, NS 200' />
            <SelectItem title='Pulsar, 125Neon' />
            <SelectItem title='Pulsar, 150' />
          </Select>
          <Select
            selectedIndex={selectDelearIndex}
            onSelect={index => setSelectDelearIndex(index)}
            label='Select Delear'
            value={selectedDealrs}
            placeholder='Select One...'
          >
            <SelectItem title='RT Krishna' />
            <SelectItem title='Nidhi Motors' />
            <SelectItem title='SS Motors' />
            <SelectItem title='Anant Bajaj' />
            <SelectItem title='Amba Bajaj' />
          </Select>
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
