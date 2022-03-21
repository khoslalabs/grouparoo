import React, { useContext, Fragment } from 'react'
import { Button } from '@ui-kitten/components'
import { Platform, PermissionsAndroid, StyleSheet, View } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import ResourceFactoryConstants from '../../../../services/ResourceFactoryConstants'
import { LocalizationContext } from '../../../../translation/Translation'
import crashlytics from '@react-native-firebase/crashlytics'
import Toast from 'react-native-toast-message'
import ErrorUtil from '../../../../../../Errors/ErrorUtil'

const DownloadComponent = ({ fileUrl, uploadedDocId, fileName, headers = {} }) => {
  const { translations } = useContext(LocalizationContext)
  const resourceFactoryConstants = new ResourceFactoryConstants()
  const url = uploadedDocId
    ? `${resourceFactoryConstants.constants.lending.downloadFile}${uploadedDocId}`
    : fileUrl
  const checkPermission = async () => {
    if (Platform.OS === 'ios') {
      downloadFile()
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: translations['download.permission.title'],
            message: translations['download.permission.message']
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          downloadFile()
        } else {
          Toast.show({
            type: 'error',
            position: 'bottom',
            props: {
              title: translations['download.permission.title'],
              description: translations['download.permission.granted']
            }
          })
        }
      } catch (err) {
        crashlytics().log(ErrorUtil.createLog(err.message, undefined, 'checkPermission()', 'DownloadComponent.js'))
        throw err
      }
    }
  }

  const downloadFile = () => {
    const date = new Date()
    const FILE_URL = fileUrl
    let fileExt = getFileExtention(FILE_URL)
    if (!fileExt) {
      fileExt = '.' + fileExt[0]
    } else {
      fileExt = '.pdf'
    }
    const { config, fs } = RNFetchBlob
    const RootDir = fs.dirs.DownloadDir
    const options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          fileExt,
        description: translations['download.downloading'],
        notification: true,
        useDownloadManager: true
      }
    }
    config(options)
      .fetch('GET', url, headers)
      .then((res) => {
        Toast.show({
          type: 'success',
          position: 'bottom',
          props: {
            title: translations['download.success.title'],
            description: translations['download.downloaded']
          }
        })
      }).catch((err) => {
        console.log(err)
        crashlytics().log(ErrorUtil.createError(err, err.message, 'Error while downloading the file', url, 'downloadFile()', 'DownloadComponent.js'))
        throw err
      })
  }

  const getFileExtention = (fileUrl) => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined
  }
  return (
    <>
      <View style={styles.container}>
        <Button style={styles.button} appearance='outline' onPress={checkPermission}>
          {translations['download.downloadText']}
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    marginVertical: 5
  }
})

export default DownloadComponent
