import { browser, Permissions } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars
import {
  pushToLocalList,
  oneShotEventHandler,
  getLocalStorage,
  textNotification
} from '../index'

const hasPermission = async (
  perms: Permissions.AnyPermissions
): Promise<boolean> => {
  const alreadyHasPermission = await browser.permissions.contains(perms)
  if (alreadyHasPermission) {
    return true
  }

  try {
    const userApprovedNewPermission = await browser.permissions.request(
      perms as Permissions.Permissions
    )
    if (userApprovedNewPermission) {
      return true
    }
  } catch (e) {
    new Array(10).forEach(() => {
      console.log(
        'TODO verify that this only errors out when the user is not available'
      )
    })
    console.error(e)
    await pushToLocalList('request_perms_when_ready', perms)
  }

  return false
}

export const hasExtensionPermission = async (
  permission: string
): Promise<boolean> =>
  hasPermission({
    permissions: [permission]
  })

export const hasDomainPermission = async (domain: string): Promise<boolean> =>
  hasPermission({
    origins: ['https', 'http'].map(h => `${h}://${domain}/`)
  })

export const proposePendingPermissionsOnUserAction = () => {
  oneShotEventHandler(browser.webNavigation.onCompleted).then(() => {
    getLocalStorage('request_perms_when_ready').then(permsToAdd => {
      textNotification(
        'Provide previously requested permissions?',
        'Take a look at the optional permissions you requested?',
        async () => {
          for (const permission of permsToAdd as Permissions.Permissions[]) {
            await browser.permissions.request(permission)
          }
        }
      )
    })
  })
}
