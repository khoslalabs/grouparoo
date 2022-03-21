import { useRequest } from 'ahooks'
import React, { useEffect, useState } from 'react'
import { config } from '../../../../../../../config'
import { StyleSheet } from 'react-native'
import DataService from '../../../../services/DataService'
import Pdf from 'react-native-pdf'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
const META_DATA_PDF = 'data:application/pdf;base64'
const PdfPreviewComponent = ({ agreementUrl, onLoadComplete }) => {
  const [pdfBase64, setPdfBase64] = useState()
  const useGetBase64Pdf = useRequest(async (agreementUrl) => {
    try {
      const res = await DataService.getDataV1(agreementUrl, {
        responseType: 'blob'
      })
      const base64DataPromis = new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(res.data)
        reader.onloadend = () => resolve(reader.result)
      })
      const base64Data = await base64DataPromis
      return base64Data
    } catch (error) {
      console.log('Error while laoding blob for agreement', error)
    }
  }, {
    manual: true,
    onSuccess: (base64Data) => {
      const temp = base64Data.split(',')
      setPdfBase64(`${META_DATA_PDF},${temp[1]}`)
    },
    onError: (error) => {
      throw new Error(error.message)
    }
  })

  useEffect(async () => {
    useGetBase64Pdf.run(agreementUrl)
  }, [])
  return (
    <>
      <Pdf
        source={{ uri: pdfBase64 }}
        style={styles.pdf}
        onLoadComplete={() => onLoadComplete(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  pdf: {
    width: widthPercentageToDP('90%'),
    height: heightPercentageToDP('55%')
  }
})

export default PdfPreviewComponent
