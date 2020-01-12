import { getLocalStorage } from '../storage'
import { mocked } from 'ts-jest/utils'
import { browser } from 'webextension-polyfill-ts'
jest.mock('webextension-polyfill-ts')

const mockBrowser = mocked(browser, true)

describe('web-ext storage', () => {
  it('helper method for local storage access should call the underlying API', () => {
    expect(() => getLocalStorage('testkey')).not.toThrowError()
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith(['testkey'])
  })
})
