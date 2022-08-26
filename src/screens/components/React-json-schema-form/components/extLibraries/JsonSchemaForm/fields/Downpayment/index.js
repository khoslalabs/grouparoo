import React,{useState,useEffect}from "react";
import { View } from "react-native";
import DocumentUploadComponent from "../../common/DocumentUploadComponent";
import {
  useStyleSheet,
  StyleService,
  Text,
  SelectItem,
  Select,
  Input,
  Datepicker,
  Icon,
  IndexPath,
} from "@ui-kitten/components";
import appConstants from "../../../../../constants/appConstants";
import DocumentPicker from 'react-native-document-picker'


const CalendarIcon = (props) => <Icon {...props} name="calendar" />;

const DownpaymentField = () => {
  const [selectedIndexMethod, selectMethodIndex] = useState(new IndexPath(0));
  const selectedMode = appConstants.paymentMethod[selectedIndexMethod?.row] 
  const [value,setValue]=useState(selectedMode);

  const [payAmount, setPayAmount] = useState(0);
  const[date,setDate]=useState("");
  const [referenceNo, setsetReferenceNo] = useState("")


  useEffect(() => {
    setValue(selectedMode)
  }, [selectedMode])
  
  return (
    <View>
      <View>
        <Text>Upload receipt(if any)</Text>
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
      <View>
        <Text>Method of Payment</Text>
        {/* <Select
          selectedIndex={selectedIndexMethod}
        //   value={selectedIndexMethod}
          onSelect={(index) => selectMethodIndex(index)}
          label="Select Method"
          placeholder="Select One..."
        >
          {appConstants.paymentMethod.map((element, index) => {
            return <SelectItem key={index} title={element} />;
          })}
        </Select> */}
        <Select
        selectedIndex={selectedIndexMethod}
        onSelect={index => selectMethodIndex(index)}
        value={value}
        label="Select Method"
          placeholder="Select One..."
        >

        {/* <SelectItem title='Option 1'/>
        <SelectItem title='Option 2'/>
        <SelectItem title='Option 3'/> */}
        {appConstants.paymentMethod.map((element, index) => {
            return <SelectItem key={index} title={element} />;
          })}
      </Select>
      </View>
      <View>
        <Text>Down Payment Amount</Text>

        <Input
          placeholder="Enter the amount"
          keyboardType="numeric"
          value={payAmount}
          onChangeText={(value) => setPayAmount(value)}
        />
      </View>
      <View>
        <Text>Payment Date</Text>

        <Datepicker
          label="Label"
          caption="Caption"
          placeholder="Pick Date"
          date={date}
          onSelect={(nextDate) => setDate(nextDate)}
          accessoryRight={CalendarIcon}
        />
      </View>
      <View>
        <Text>Payment Reference Number</Text>
        <Input
          placeholder="Enter the amount"
          value={referenceNo}
          onChangeText={(value) => setsetReferenceNo(value)}
        />
      </View>
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
export default DownpaymentField;
