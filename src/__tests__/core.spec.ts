import hassClientFactory from '../index'

describe('client factory', () => {
    it('return a function you can call ', () => {
        const fn = hassClientFactory('http://localhost', 'sometoken')
        fn._request('POST', '/service')
    });
});
