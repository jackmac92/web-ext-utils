import { getLocalStorage } from '../storage'

describe('your function to test', () => {
  it('should have called a webextension API', () => {
    getLocalStorage('testkey')
    // expect(browser.storage.local.get).toHaveBeenCalledWith(['testkey'])
  })
})
