import { browser, Permissions } from 'webextension-polyfill-ts' // eslint-disable-line no-unused-vars
import { oneShotEventHandler } from '../helpers/index'
import {
  pushToLocalList,
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
    await pushToLocalList('request_perms_when_ready', perms)
  }

  return false
}

/**
 * @category permissions
 */
export const hasExtensionPermission = async (
  permission: string
): Promise<boolean> =>
  hasPermission({
    permissions: [permission]
  })

/**
 * @category permissions
 */
export const hasDomainPermission = async (domain: string): Promise<boolean> =>
  hasPermission({
    origins: ['https', 'http'].map(h => `${h}://${domain}/`)
  })

/**
 * @hidden
 */
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
