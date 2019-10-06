import { elementLocated } from '../index'

jest.mock('webextension-polyfill-ts')

describe('client factory', () => {
  it('return a function you can call ', () => {
    expect(() => elementLocated(undefined)).not.toThrowError()
  })
})
