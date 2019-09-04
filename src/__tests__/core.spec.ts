import core from '../index'

describe('client factory', () => {
  it('return a function you can call ', () => {
    expect(() => core('test')).not.toThrowError()
  })
})
