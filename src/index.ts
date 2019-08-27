import * as mqtt from 'mqtt'

type messageHandler = (s: string, z: string) => void

interface Listeners {
  [key: string]: messageHandler[]
}

export const mqttHostEncompassesOther = (host: string, other: string) => {
  if (host === other) {
    return true
  }
  if (host.endsWith('/#') && other.startsWith(host.slice(0, -2))) {
    return true
  }
  return false
}

export class MqttHandler {
  private _listeners: Listeners = {}
  private _subscriptions: string[] = []
  private _ready = false
  private client: any = null

  public constructor(addr: string, _opts: object = {}) {
    const opts = {
      ..._opts,
      protocolVersion: 4
    }
    this.client = mqtt.connect(addr, opts)
    const connectTimeout = setTimeout(() => {
      throw Error('mqtt connection timeout!')
    }, 10000)
    this.client.on('connect', () => {
      clearTimeout(connectTimeout)
      this._ready = true
    })
    this.client.on('message', (topic: string, message: string) => {
      const handlers = this.getTopicListeners(topic)
      const logMsg = (() => {
        const base = `Mqtt message received for topic: ${topic}`
        if (message.length <= 20) {
          return `${base}\nmessage: ${message}`
        }
        return `${base}\nmessage (truncated): ${message.slice(0, 20)}`
      })()
      if (handlers) {
        const msg = message.toString()
        handlers.forEach(handler => {
          handler(msg, topic)
        })
      }
    })
    return this
  }

  public shutdown = () => {
    this.client.end(true)
  }

  public isReady = () => {
    return this._ready
  }

  private getListeners = () => {
    return { ...this._listeners }
  }

  private getTopicListeners = (topic: string) => {
    // TODO do I need to match wildcards in the middle of the topic name?
    const listeners = this.getListeners()
    const baseListeners = listeners[topic] || []
    const potentialAdditionalTopics = Object.keys(this._listeners).filter(t =>
      t.endsWith('/#')
    )
    const topicMatch = (t: string) => topic.includes(t.slice(0, -2))
    const matchingTopics = potentialAdditionalTopics.filter(topicMatch)
    return matchingTopics.reduce(
      (acc, t) => [...acc, ...listeners[t]],
      baseListeners
    )
  }

  public register = (topic: string, handler: messageHandler) => {
    this._listeners = (() => {
      const newListeners = { ...this._listeners }
      if (!newListeners[topic]) {
        newListeners[topic] = []
      }
      newListeners[topic].push(handler)
      return newListeners
    })()

    return new Promise((resolve, reject) => {
      if (this._subscriptions.some(s => mqttHostEncompassesOther(s, topic))) {
        resolve()
      } else {
        this.client.subscribe(topic, { qos: 1 }, (err: any) => {
          if (err) {
            reject(err)
          } else {
            this._subscriptions.push(topic)
            resolve()
          }
        })
      }
    })
  }

  public deregister = (topic: string, handler: messageHandler) => {
    return new Promise((resolve, reject) => {
      this._listeners[topic] = this._listeners[topic].filter(h => h !== handler)
      if (this._listeners[topic].length === 0) {
        delete this._listeners[topic]
      }
      this.client.unsubscribe(topic, (err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

const mqttMachine = new MqttHandler('mqtt://jackm.pizza:1883', {
  username: 'jackmac',
  password: 'peanuts'
})

export const receivedSpecificMessage = async (
  topic: string,
  messageIdentifyCb: (a: string) => boolean,
  timeoutSec = 20
) =>
  new Promise((resolve, reject) => {
    const tmpHandler = async (msg: string) => {
      const isMessageMatch = await Promise.resolve(messageIdentifyCb(msg))
      if (isMessageMatch) {
        setTimeout(() => mqttMachine.deregister(topic, tmpHandler), 333)
        resolve(msg)
      }
    }
    setTimeout(() => {
      mqttMachine.deregister(topic, tmpHandler)
      reject(Error('timeout'))
    }, timeoutSec * 1000)
    mqttMachine.register(topic, tmpHandler)
  })

export default (topic: string, messageHandler: messageHandler) => {
  mqttMachine.register(topic, messageHandler)
  return () => {
    mqttMachine.deregister(topic, messageHandler)
  }
}
