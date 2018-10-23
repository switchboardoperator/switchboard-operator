const topologyExampleConf = require('./test/configurationFixtures.json')
import * as rabbit from 'rabbot'

import Topology from './Topology'
import RabbotClient from './RabbotClient'

describe('RabbotClient', () => {
  // To be mocked
  it('Should connect to rabbitmq', (done) => {
    const topology = new Topology(topologyExampleConf)
    const rabbotClient = new RabbotClient(rabbit, topology.getTopology(), [])
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
