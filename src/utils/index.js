import Gzip, { Base64 } from './Gzip'
import isUndefined from 'lodash.isundefined'
var LoanJS = require('loanjs');
const rupeeFormatter = x => {
  if (isUndefined(x)) {
    return
  }
  x = Math.round(x).toString()
  let afterPoint = ''
  if (x.indexOf('.') > 0) afterPoint = x.substring(x.indexOf('.'), x.length)
  x = Math.floor(x)
  x = x.toString()
  let lastThree = x.substring(x.length - 3)
  const otherNumbers = x.substring(0, x.length - 3)
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + afterPoint
  return `${res}`
}
const calculateEmi = (loanAmount, tenure, selectedRepayment, loanOfferUnit, interestRate) => {
  try {
    const obj = new LoanJS.Loan(loanAmount, tenure, interestRate)
    const installments = obj?.installments
    return Math.round(installments[0].installment)
  } catch (error) {
    throw new Error('ERROR_OCCURRED_WHILE_CALCULATING_EMI', error)
  }
}
export {
  Gzip,
  Base64,
  rupeeFormatter,
  calculateEmi
}
