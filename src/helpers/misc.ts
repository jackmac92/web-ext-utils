import { getLocalStorage, setLocalStorage } from '../browser-apis/storage'

const installIdKey = 'applicationId__unieq'

export const getInstallId = () =>
  getLocalStorage<string, string | null>(installIdKey)

export const ensureInstallId = async () => {
  const localId = await getInstallId()
  if (!localId || localId.length === 0) {
    const result = Math.random() * 1000000000000
    await setLocalStorage(installIdKey, result)
  }
}
