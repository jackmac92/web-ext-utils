import fetch from '@pika/fetch';

export default function hassClientFactory(host, authToken) {
  const request = (method, path, data = {}) => {
    const body = JSON.stringify(data)
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
