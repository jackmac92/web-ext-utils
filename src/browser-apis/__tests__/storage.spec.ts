import { getLocalStorage } from '../storage'

describe('your function to test', () => {
  it('should have called a webextension API', () => {
    getLocalStorage('testkey')
    // expect(chrome.storage.local.get).toHaveBeenCalledWith(['testkey'])
  })
})
