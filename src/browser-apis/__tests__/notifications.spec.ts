import { textNotification } from '../notifications'
import { mocked } from 'ts-jest/utils'
import { browser } from 'webextension-polyfill-ts'
jest.mock('webextension-polyfill-ts')

const mockBrowser = mocked(browser, true)

describe('storage API helper', () => {
  it('local storage access should call the underlying API', () => {
    expect(() => textNotification('testtiitle', 'subtitle')).not.toThrowError()
    expect(mockBrowser.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'testtiitle',
        message: 'subtitle'
      })
    )
  })
})
