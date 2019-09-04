import fetch from '@pika/fetch'

export default function hoozieWutzit(watevr) {
  return {
    doAFetch: () => fetch('https://google.com'),
    howdy: () => console.log('hello ', watevr)
  }
}
