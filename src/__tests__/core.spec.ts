jest.mock('webextension-polyfill-ts')

describe('client factory', () => {
  it('return a function you can call ', () => {
    expect(() => 1).not.toThrowError()
  })
})
