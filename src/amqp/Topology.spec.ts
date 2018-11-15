const topologyExampleConf = require('./test/configurationFixtures.json')
import Topology from './Topology'

describe('Topology', () => {
  const topology = new Topology(topologyExampleConf)
  const renderedTopology = topology.getTopology()

  it('should crete a rabbot topology with provided events and tasks', () => {
    expect(typeof renderedTopology).toBe('object')
    expect(typeof renderedTopology.connection).toBe('object')
    expect(renderedTopology.connection.server).toEqual('127.0.0.1')
    expect(renderedTopology.connection.port).toEqual(5672)
  })

  it('should generate exchanges', () => {
    expect(Array.isArray(renderedTopology.exchanges)).toBeTruthy()
    expect(typeof renderedTopology.exchanges[0]).toBe('object')
    expect(renderedTopology.exchanges[0].name).toBeDefined()
    expect(renderedTopology.exchanges[0].type).toBeDefined()
    expect(renderedTopology.exchanges[1].name).toBeDefined()
    expect(renderedTopology.exchanges[1].type).toBeDefined()
  })

  it('should generate queues', () => {
    expect(Array.isArray(renderedTopology.queues)).toBeTruthy()
    expect(typeof renderedTopology.queues[0]).toBe('object')
    expect(renderedTopology.queues[0].name).toBeDefined()
  })

  it('should generate bindings', () => {
    expect(Array.isArray(renderedTopology.bindings)).toBeTruthy()
    expect(typeof renderedTopology.bindings[0]).toBe('object')
    expect(renderedTopology.bindings[0].exchange).toBeDefined()
    expect(renderedTopology.bindings[0].target).toBeDefined()
  })

  describe('getEventByName', () => {
    it('should return an event by its name', () => {
      const event = topology.getEventByName('members')
      expect(typeof event).toBe('object')
      expect(event.eventName).toEqual('members')
    })
  })
})
