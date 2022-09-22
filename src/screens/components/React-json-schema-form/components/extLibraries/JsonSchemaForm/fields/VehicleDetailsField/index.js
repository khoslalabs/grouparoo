import {
  Select,
  SelectItem,
  Text,
  useStyleSheet,
  StyleService,
} from "@ui-kitten/components";
import React, { useEffect, useState,useContext } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DocumentUploadComponent from "../../common/DocumentUploadComponent";
import DocumentPicker from "react-native-document-picker";
import { brands, delears, getModelsArray } from "./Data";
import isEmpty from "lodash.isempty";
import { useRequest } from "ahooks";
import MaskedInput from "../../../textMask/text-input-mask";
import { useFormContext } from "../../FormContext";
import { Spinner } from '@ui-kitten/components'
import IconUtil from '../../../../common/IconUtil';
import Toast from 'react-native-toast-message'
import ResourceFactoryConstants from '../../../../../services/ResourceFactoryConstants'
import DataService from '../../../../../services/DataService'
import { LocalizationContext } from '../../../../../translation/Translation'



const validateNo = async (dispatch, gstin) => {
  const resourseFactoryConstants = new ResourceFactoryConstants()

  const url = `${resourseFactoryConstants.constants.registrationNo.verifyNo}`
  try {
    const res = await DataService.getData(url)
    debugger
    const response = res?.data
    if (response.status === 'SUCCESS') {
      await Promise.all([
        dispatch.formDetails.setGstnData(response.data),
        dispatch.formDetails.setIsGSTVerified('Yes')
      ])
      return { success: true }
    } else {
      console.log(response.message)
      throw new Error('INVALID_REGISTRATION_NO_ENTERED')
    }
  } catch (e) {
    if (e.message === 'INVALID_REGISTRATION_NO_ENTERED') {
      throw e
    } else {
      throw new Error('CANNOT_REACH_REGISTRATION_NO_VALIDATION_SERVER')
    }
  }
}


const VehicleDetailsField = (props) => {
  const { theme } = useFormContext();
  const styles = useStyleSheet(themedStyles);
  const { translations } = useContext(LocalizationContext)


  const dispatch = useDispatch();
  const filledData = props.formData;
  console.log("filledData", filledData);
  const state = useSelector((state) => state);
  const [selectBrandIndex, setSelectBrandIndex] = useState();
  const [selectModelIndex, setSelectModelIndex] = useState();
  const [selectDelearIndex, setSelectDelearIndex] = useState();
  const [invalid, setInvalid] = useState(false)

  const [no, setNo] = useState('')

  const selectedBrand = brands[selectBrandIndex?.row] || filledData?.brand;
  const selectedDealr = delears[selectDelearIndex?.row] || filledData?.dealer;
  let models = [];
  if (selectedBrand && selectedDealr) {
    models = getModelsArray(selectedBrand, selectedDealr);
  }
  const selectedModel =
    models[selectModelIndex?.row] || filledData.vehicleDetails;
  const vehicleType = state?.formDetails?.formData?.vehicleType
    ? state?.formDetails?.formData?.vehicleType
    : "New";

  console.log(
    "vehicleType in vehicle details",
    vehicleType,
    state?.formDetails?.formData
  );

  const useValidateno = useRequest(validateNo, {
    manual: true,
    onError: (error) => {
      setInvalid(true)
      props.onChange(undefined)
      if (error.message === 'CANNOT_REACH_REGISTRATION_VALIDATION_SERVER') {
        throw error
      } else {
        Toast.show({
          type: 'error',
          position: 'bottom',
          props: {
            title: translations['rNo.title'],
            description: translations['rNo.failed']
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
          title: translations['rNo.title'],
          description: translations['rNo.success']
        }
      })
    }
  })

  const getTickMark = () => {
    if (!props.value) {
      if (useValidateno.loading) {
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

  const setSelectedVehicleModel = useRequest(
    (data, dispatch) => {
      dispatch.formDetails.setSelectedVehicleModel(data);
      return data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        props.onChange({
          ...data,
          exShowroomPrice: parseInt(data.exShowroomPrice),
          margin: parseInt(data.margin),
        });
      },
    }
  );

  const onGstnChangeHandler = (no) => {
    setNo(no);
    if (isEmpty(no) || (no && no.length !== 10)) {
      return
    }
    useValidateno.run(dispatch, no)
  };
  useEffect(() => {
    if (!isEmpty(selectedModel)) {
      setSelectedVehicleModel.run(selectedModel, dispatch);
    }
  }, [selectedModel]);
  return (
    <View>
      {vehicleType === "New" && (
        <View>
          <Select
            selectedIndex={selectBrandIndex}
            value={selectedBrand}
            onSelect={(index) => setSelectBrandIndex(index)}
            label="Select Brand"
            placeholder="Select One..."
          >
            {brands.map((element, index) => {
              return <SelectItem key={index} title={element} />;
            })}
          </Select>
          <Select
            selectedIndex={selectDelearIndex}
            onSelect={(index) => setSelectDelearIndex(index)}
            label="Select Delear"
            value={selectedDealr}
            placeholder="Select One..."
          >
            {delears.map((element, index) => {
              return <SelectItem key={index} title={element} />;
            })}
          </Select>
          {models && models.length > 0 && (
            <Select
              selectedIndex={selectModelIndex}
              onSelect={(index) => setSelectModelIndex(index)}
              label="Select Model"
              value={
                !isEmpty(selectedModel) || !isEmpty(filledData)
                  ? `${selectedModel?.model || filledData?.model}, ${
                      selectedModel?.variation || filledData?.variation
                    }`
                  : "Select One..."
              }
            >
              {models.map((element, index) => {
                return (
                  <SelectItem
                    key={index}
                    title={`${element?.model}, ${element?.variation}`}
                  />
                );
              })}
            </Select>
          )}
          <View style={{ marginTop: 5 }}>
            <Text appearance="hint" category="label">
              'Quotation/Proforma Invoice'
            </Text>
            <DocumentUploadComponent
              isUploadDone={false}
              onFileChange={(f) => console.log(f)}
              multiple
              files={[]}
              type={[DocumentPicker.types.pdf]}
              loading={false}
              selectText="Upload Qotation/Proforma Invoice"
              removeFile={() => {
                console.log();
              }}
              isAddMore={false}
              reset={false}
            />
          </View>
        </View>
      )}
      {vehicleType === "Old" && (
        <View>
          {/* <Text appearance="hint" category="label">
            'Registration Number'
          </Text> */}

          <MaskedInput
            type="custom"
            label="Registration Number"
            options={{
              mask: "AA99AA9999",
            }}
            autoFocus={true}
            includeRawValueInChangeText
            // multiline={"multiline"}
            placeholder={"XX12XX1234"}
            // autoFocus={autofocus}
            // editable={!disabled && !readonly}
            keyboardType="visible-password"
            value={no}
            // secureTextEntry={secureEntry}
            // textContentType={textContentType}
            onChangeText={(_, rawText) => onGstnChangeHandler(rawText)}
            // // onBlur={onBlurTextHandler}
            // onFocus={() => {
            //   onFocus(id, value)
            // }}
            selectionColor={theme.highlightColor}
            // placeholderTextColor={theme.placeholderTextColor}
            // status={hasErrors && 'danger'}
            accessoryRight={() => getTickMark()}
          />
                <View style={styles.rangeSelector}>


          {/* <Text appearance="hint" category="label">
            'Valuation of the vehicle'
          </Text> */}
          <MaskedInput
            type="money"
            label="Valuation of the vehicle"
            options={{
              precision: 0,
              separator: ".",
              delimiter: ",",
              suffixUnit: "",
            }}
            includeRawValueInChangeText
            // multiline={"multiline"}
            placeholder={"Amount"}
           
            // editable={!disabled && !readonly}
            keyboardType={"numeric"}
            // value={value ? value.toString() : ""}
            // secureTextEntry={secureEntry}
            // textContentType={textContentType}
            // onChangeText={(newText, rawText) =>
            //   onChange(rawText === "" ? options.emptyValue : parseInt(rawText))
            // }
            // onBlur={() => {
            //   onBlur(id, value);
            // }}
            // onFocus={() => {
            //   onFocus(id, value);
            // }}
            selectionColor={theme.highlightColor}
            // placeholderTextColor={theme.placeholderTextColor}
            // status={hasErrors && "danger"}
            // accessoryLeft={() => <Text>Rs.</Text>}
          />
        </View>
        </View>
      )}
    </View>
  );
};

const themedStyles = StyleService.create({
  rangeSelector: {
    marginTop: 16,
  },
  container: {
    marginTop: 16,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
export default VehicleDetailsField;
