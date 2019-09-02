import mqtt from 'mqtt'

export const mqttClientFactory = (addr, topic, connectOpts = {}) => {
  const sinks = []
  const buffer = []
  let mqttClient = null

  function sendToSinks(type, data) {
    const zinkz = sinks.slice(0)

    zinkz.forEach(sink => {
      if (sinks.indexOf(sink) > -1) {
        sink(type, data)
      }
    })
  }

  function sendToMqtt(data) {
    if (mqttClient) {
      mqttClient.publish(topic, data)
    } else {
      buffer.push(data)
    }
  }

  function connectMqtt() {
    if (!mqttClient) {
      mqttClient = mqtt.connect(addr, connectOpts)
      mqttClient.onconnect = () => {
        let data
        while ((data = buffer.pop())) {
          mqttClient.publish(topic, data)
        }
      }
      mqttClient.on('connect', mqttClient.onconnect)
      mqttClient.onmessage = (topic: string, message: string) => {
        sendToSinks(1, { topic, message })
      }
      mqttClient.on('message', mqttClient.onmessage)
      mqttClient.onclose = err => {
        sendToSinks(2, err)
      }
      mqttClient.on('close', mqttClient.onclose)
    }
  }

  function disconnectMqtt() {
    if (mqttClient) {
      if (!mqttClient.connected) {
        console.warn('Attempting to disconnect a non connected client')
      }
      mqttClient.close()
      mqttClient = null
    }
  }

  return (type, data) => {
    if (type === 0) {
      // Source
      const sink = data
      sinks.push(sink)
      connectMqtt()

      // Source handshake
      sink(0, t => {
        if (t === 2) {
          const i = sinks.indexOf(sink)
          if (i > -1) {
            sinks.splice(i, 1)
          }

          if (sinks.length === 0) {
            disconnectMqtt()
          }
        }
      })
    } else if (typeof type === 'function') {
      // Sink
      const source = type

      // Automatically pull from source
      source(0, (type, data) => {
        if (type === 1) {
          sendToMqtt(data)
        }
      })
    } else if (type === 1) {
      // Manually send data
      sendToMqtt(data)
    } else if (type === 2) {
      // Manually disconnect
      disconnectMqtt()
    }
  }
}

export default /*#__PURE__*/ mqttClientFactory
