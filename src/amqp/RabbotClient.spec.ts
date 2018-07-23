const topologyExampleConf = require('./test/configurationFixtures.json')
const Topology = require('./Topology')
const RabbotClient = require('./RabbotClient')
const rabbit = require('rabbot')

describe('RabbotClient', () => {
  // To be mocked
  it('Should connect to rabbitmq', (done) => {
    const topology = new Topology(topologyExampleConf)
    const rabbotClient = new RabbotClient(topology.getTopology())
    // rabbotClient.start()
    done()
  })

  it('Should map rabbit handlers to actions', (done) => {
    const topology = new Topology(topologyExampleConf)
    const rabbotClient = new RabbotClient(
      rabbit,
      topology.getTopology(),
      topologyExampleConf.events
    )
    rabbotClient.mapActionsToHandlers()
    done()
  })
})
