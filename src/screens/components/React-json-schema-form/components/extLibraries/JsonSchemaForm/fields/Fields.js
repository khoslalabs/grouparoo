import TitleField from './TitleField'
import MultiSchemaField from './MultiSchemaField'
import BooleanField from './BooleanField'
import NullField from './NullField.js'
import NumberField from './NumberField'
import StringField from './StringField'
import SchemaField from './SchemaField'
import UnsupportedField from './UnsupportedField'
import DescriptionField from './DescriptionField'
import ObjectField from './ObjectField'
import ArrayField from './ArrayField'
import AddressInputField from './AddressInputField'
import BankStatementUploadField from './BankStatementUploadField'
import ITRUploadField from './ITRUploadField'
import LoanOfferField from './LoanOfferField'
import BankAccountConfirmationWidget from '../widgets/BankAccountConfirmationWidget'
import VehicleDetailsField from './VehicleDetailsField'
import IndicativeLoanOfferField from './IdicativeLoanOffer'
import Downpayment from './Downpayment'
export const Fields = {
  TitleField,
  AnyOfField: MultiSchemaField,
  OneOfField: MultiSchemaField,
  BooleanField,
  NullField,
  NumberField,
  StringField,
  SchemaField,
  UnsupportedField,
  DescriptionField,
  ObjectField,
  ArrayField,
  'np-address-input-field': AddressInputField,
  'np-bank-statement-field': BankStatementUploadField,
  'np-itr-upload-field': ITRUploadField,
  'np-loan-offer-field': LoanOfferField,
  'np-bank-account-details-field': BankAccountConfirmationWidget,
  'np-vehicle-details-field': VehicleDetailsField,
  'np-twl-indicative-offer': IndicativeLoanOfferField,
  'np-downpayment-field':Downpayment,
}
