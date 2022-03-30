import orderBy from 'lodash.orderby'
import { PERMISSIONS } from 'react-native-permissions'
import { checkPermissions } from '../../services/permissions'
import { config } from '../../config'
import { AppStorage } from '../../services/app-storage.service'
const permissionsHelp = {
  name: 'permissionsHelp',
  state: {
    isPermissionsRequested: false,
    helpContent: {
      title: 'help.permissions.title',
      description: 'help.permissions.content',
      helpSteps: [{
        order: 1,
        title: 'help.camera.title',
        content: 'help.camera.content',
        icon: 'CameraIcon'
      },
      {
        order: 2,
        title: 'help.sms.title',
        content: 'help.sms.content',
        icon: 'SmsIcon'
      },
      {
        order: 3,
        title: 'help.location.title',
        content: 'help.location.content',
        icon: 'LocationIcon'
      },
      {
        order: 4,
        title: 'help.phone.title',
        content: 'help.phone.content',
        icon: 'DeviceIcon'
      },
      {
        order: 5,
        title: 'help.contacts.title',
        content: 'help.contacts.content',
        icon: 'ContactListIcon'
      }]
    },
    rationale: {
      [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]: {
        title: 'permissions.location.title',
        message: 'permissions.location.message',
        buttonPositive: 'permissions.positive',
        buttonNegative: 'permissions.negative'
      },
      [PERMISSIONS.ANDROID.CAMERA]: {
        title: 'permissions.camera.title',
        message: 'permissions.camera.message',
        buttonPositive: 'permissions.positive',
        buttonNegative: 'permissions.negative'
      },
      [PERMISSIONS.ANDROID.READ_SMS]: {
        title: 'permissions.sms.title',
        message: 'permissions.sms.message',
        buttonPositive: 'permissions.positive',
        buttonNegative: 'permissions.negative'
      }
    },
    permissions: {
    }
  },
  selectors: {
    getIsPermissionsRequested: () => rootState => rootState.permissionsHelp.isPermissionsRequested,
    getHelpSteps: () => rootState => {
      return orderBy(rootState.permissionsHelp.helpContent.helpSteps, ['order'], ['asc'])
    },
    getHelpTitle: () => rootState => {
      return {
        title: rootState.permissionsHelp.helpContent.title,
        description: rootState.permissionsHelp.helpContent.description
      }
    },
    getPermissions: () => rootState => {
      return rootState.permissionsHelp.permissions
    },
    getPermissionsRationale: () => rootState => {
      return rootState.permissionsHelp.rationale
    },
    allPermissionsValid: () => rootState => {
      let allowed = true
      const acceptedResults = config.permissions.acceptedResults
      // Camera permission Needed
      const { permissionsHelp: { permissions } } = rootState
      if (acceptedResults.indexOf(permissions[PERMISSIONS.ANDROID.CAMERA]) === -1) {
        allowed = false
        return allowed
      }
      if (acceptedResults.indexOf(permissions[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]) === -1) {
        allowed = false
        return allowed
      }
      if (acceptedResults.indexOf(permissions[PERMISSIONS.ANDROID.READ_SMS]) === -1) {
        allowed = false
        return allowed
      }
      return allowed
    }
  },
  reducers: {
    updatePermissions: (state, { permissionStatuses, isPermissionsRequested }) => {
      state.permissions = permissionStatuses
      state.isPermissionsRequested = isPermissionsRequested
      return Object.assign({}, state)
    }
  },
  effects: (dispatch) => ({
    async checkRequiredPermissions (_, rootState) {
      const isPermissionsRequested = await AppStorage.getPermissionsRequested()
      const permissionStatuses = await checkPermissions()
      dispatch.permissionsHelp.updatePermissions({ permissionStatuses, isPermissionsRequested })
    },
    async updatePermissionStatuses ({ permissionStatuses, isPermissionsRequested }, rootState) {
      await AppStorage.setPermissionsRequested(isPermissionsRequested)
      dispatch.permissionsHelp.updatePermissions({ permissionStatuses, isPermissionsRequested })
    }
  })
}
export default permissionsHelp
