import { IndexPath, Select, SelectItem } from '@ui-kitten/components'
import React, { Fragment, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

const VehicleDetailsField = (props) => {
  const state = useSelector(state => state)
  const [selectBrandIndex, setSelectBrandIndex] = useState(new IndexPath(0))
  const [selectModelIndex, setSelectModelIndex] = useState(new IndexPath(0))
  const vehicleType = state?.formDetails?.vehicleType ? state?.formDetails?.vehicleType : 'Old'
  return (
    <>
      {vehicleType === 'Old' &&
        <View>
          <Select
            selectedIndex={selectBrandIndex}
            onSelect={index => setSelectBrandIndex(index)}
            label='Select Brand'
          >
            <SelectItem title='Select One...' />
            <SelectItem title='Hero' />
            <SelectItem title='Bajaj' />
          </Select>
          <Select
            selectedIndex={selectModelIndex}
            onSelect={index => setSelectModelIndex(index)}
            label='Select Model'
          >
            <SelectItem title='Select One...' />
            <SelectItem title='Splendor Plus, Self with Alloy Wheel' />
            <SelectItem title='Splendor Plus, Black and Accent' />
            <SelectItem title='Splendor Plus, Self with Alloy Wheel and i3S' />
          </Select>
          {/* Upload  */}
        </View>}
      {vehicleType === 'New' && <View>
          
       </View>}
    </>
  )
}
export default VehicleDetailsField
