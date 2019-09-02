import mqtt from 'mqtt'
import { mqttClientFactory } from '..'

let mqttClientMock,
  mqttConnectHandler,
  mqttConnectMock,
  mqttClientOn,
  mqttClientClose

jest.mock('mqtt')

describe('fromWebsocket', () => {
  beforeEach(() => {
    mqttClientOn = jest.fn()
    mqttClientClose = jest.fn()
    mqttClientMock = {
      on: mqttClientOn,
      close: mqttClientClose,
      connected: true
    }
    mqttConnectHandler = jest.fn(() => mqttClientMock)
    mqttConnectMock = jest.spyOn(mqtt, 'connect')
    mqttConnectMock.mockImplementation(mqttConnectHandler)
  })
  describe('as source', () => {
    it('creates new connection with first sink', () => {
      const mqtt = mqttClientFactory('url', 'topic')
      expect(mqttConnectHandler).not.toHaveBeenCalled()

      mqtt(0, () => {})
      expect(mqttConnectHandler).toHaveBeenCalledTimes(1)
      expect(mqttConnectHandler).toHaveBeenCalledWith('url', {})
    })

    it('attaches websocket handles on connect', done => {
      const mqtt = mqttClientFactory('url', 'topic')
      mqtt(0, () => {})
      setTimeout(() => {
        expect(mqttClientMock.on).toHaveBeenCalledWith(
          'connect',
          expect.any(Function)
        )
        done()
      })
    })

    it('sends message to sinks when arrives from websocket', () => {
      const mqtt = mqttClientFactory('url', 'topic')
      const sinkMock = jest.fn()
      mqtt(0, sinkMock)
      sinkMock.mockReset()
      mqttClientMock.onmessage('topic', 'msg')
      expect(sinkMock).toHaveBeenCalledTimes(1)
      expect(sinkMock).toHaveBeenCalledWith(1, {
        topic: 'topic',
        message: 'msg'
      })
    })

    it('removes sink when it sends exit code', () => {
      const mqtt = mqttClientFactory('url', 'topic')
      const sinkMock = jest.fn()
      mqtt(0, sinkMock)

      const sinkChannel = sinkMock.mock.calls[0][1]
      sinkMock.mockReset()
      sinkChannel(2)

      mqttClientMock.onmessage('msg')
      expect(sinkMock).not.toHaveBeenCalled()
    })

    it('disconnects when last sink removed', () => {
      const mqtt = mqttClientFactory('url', 'topic')
      const sinkMock = jest.fn()
      mqtt(0, sinkMock)
      const sinkChannel = sinkMock.mock.calls[0][1]
      expect(mqttConnectHandler).toHaveBeenCalledTimes(1)
      expect(mqttConnectHandler).toHaveBeenCalledWith('url', {})
      sinkChannel(2)

      expect(mqttClientClose).toHaveBeenCalledTimes(1)
    })

    it('connects to websocket with another sink after disconnecting', () => {
      const mqtt = mqttClientFactory('url', 'topic')
      const sinkMock = jest.fn()
      mqtt(0, sinkMock)
      const sinkChannel = sinkMock.mock.calls[0][1]
      sinkChannel(2)
      mqtt(0, sinkMock)
      expect(mqttConnectHandler).toHaveBeenCalledTimes(2)
      expect(mqttConnectHandler).toHaveBeenCalledWith('url', {})
    })
  })

  describe('as sink', () => {})
})
