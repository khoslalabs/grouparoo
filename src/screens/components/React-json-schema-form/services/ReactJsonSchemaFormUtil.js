import DataService from './DataService'
import ResourceFactoryConstants from './ResourceFactoryConstants'
import dayjs from 'dayjs'
// import imageCompression from "browser-image-compression";

const ReactJsonSchemaUtil = {
  numberWithCommas(x) {
    x = x.toString()
    let lastThree = x.substring(x.length - 3)
    const otherNumbers = x.substring(0, x.length - 3)
    if (otherNumbers !== '') lastThree = ',' + lastThree
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
    return res
  },
  generateOTP(primaryPhone) {
    return DataService.postData(
      `${new ResourceFactoryConstants().constants.otp.generateOTP}`,
      {
        mob: primaryPhone
      }
    )
  },
  getMaskedAadhar(aadhar) {
    const prefix = 'XXXX XXXX '
    const suffix = aadhar.toString().substring(10)
    return prefix + suffix
  },
  formatDateToDefaultDate(date, actualFormat, newformat = 'MM/DD/YYYY') {
    return dayjs(date, actualFormat).format(newformat)
  },
  getRandomUUID() {
    return (
      Math.random().toString(36).substr(1, 12) + '_' + new Date().getTime()
    )
  },
  getFileName(files) {
    const temp = []
    for (const file of files) {
      temp.push(file.name)
    }
    return temp
  },
  getQueryParams (textUrl) {
    const queryParamObject = {}
    if (textUrl.indexOf('?') === -1) return queryParamObject
    const paramString = textUrl.split('?')[1]
    const paramsArr = paramString.split('&')
    for (let i = 0; i < paramsArr.length; i++) {
      const pair = paramsArr[i].split('=')
      if (pair && pair.length > 1 && pair[0] && pair[1]) {
        queryParamObject[pair[0]] = pair[1]
      }
    }
    return queryParamObject
  },
  getUploadedFileIdsWithNameArray (data) {
    const uploadedFileIdsWithName = []
    data.forEach(data => {
      const temp = data.split('::')
      uploadedFileIdsWithName.push({
        fileId: temp[0],
        name: temp[1]
      })
    })
    return uploadedFileIdsWithName
  }
}

export default ReactJsonSchemaUtil
