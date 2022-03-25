const ErrorUtil = {
  createError: (stackTrace, errorCode, errorMessage, params, methodName, fileName) => {
    return JSON.stringify({
      stackTrace: stackTrace,
      errorCode: errorCode,
      errorMessage: errorMessage,
      params: params,
      methodName: methodName,
      fileName: fileName
    })
  },
  createLog: (message, params, methodName, fileName) => {
    return JSON.stringify({
      message: message,
      params: params,
      methodName: methodName,
      fileName: fileName
    })
  }
}

export default ErrorUtil
