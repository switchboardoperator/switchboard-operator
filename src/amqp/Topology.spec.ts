import { expect } from 'chai'
import Topology from './Topology'
import topologyExampleConf from './test/configurationFixtures'

describe('Topology', () => {
  const topology = new Topology(topologyExampleConf)
  const renderedTopology = topology.getTopology()

  it('should crete a rabbot topology with provided events and tasks', (done) => {
    expect(renderedTopology).to.be.a('object')
    expect(renderedTopology.connection).to.be.a('object')
    expect(renderedTopology.connection.server).to.equals('127.0.0.1')
    expect(renderedTopology.connection.port).to.equals(5672)
    done()
  })

  it('should generate exchanges', (done) => {
    expect(renderedTopology.exchanges).to.be.a('array')
    expect(renderedTopology.exchanges[0]).to.be.a('object')
    expect(renderedTopology.exchanges[0].name).to.exist
    expect(renderedTopology.exchanges[0].type).to.exist
    expect(renderedTopology.exchanges[1].name).to.exist
    expect(renderedTopology.exchanges[1].type).to.exist
    done()
  })

  it('should generate queues', (done) => {
    expect(renderedTopology.queues).to.be.a('array')
    expect(renderedTopology.queues[0]).to.be.a('object')
    expect(renderedTopology.queues[0].name).to.exist
    done()
  })

  it('should generate bindings', (done) => {
    expect(renderedTopology.bindings).to.be.a('array')
    expect(renderedTopology.bindings[0]).to.be.a('object')
    expect(renderedTopology.bindings[0].exchange).to.exist
    expect(renderedTopology.bindings[0].target).to.exist
    done()
  })

  describe('getEventByName', () => {
    it('should return an event by its name', (done) => {
      const event = topology.getEventByName('members')
      expect(event).to.be.an('object')
      expect(event.eventName).to.equals('members')
      done()
    })
  })
})
