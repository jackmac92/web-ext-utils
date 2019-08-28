import fetch from '@pika/fetch';

export default function hassClientFactory(host: string, authToken: string) {
  const request = (method, path: string, data = {}) => {
    const body = (() => {
      if (method === "GET" || method === "HEAD") {
        return null
      }
      return JSON.stringify(data)
    })()
    return fetch(
      `${host}/api/${path}`,
      {
        method,
        body,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      }
    )
  }

  return {
    _request: request,
  }
}
