import * as path from 'path'
import * as config from 'config'
import * as express from 'express'
import * as expressNunjucks from 'express-nunjucks'
import * as logger from 'winston'
import * as rabbit from 'rabbot'

import { loadOperators } from './services/OperatorsLoader'
import Config from './model/Config'
import RabbotClient from './amqp/RabbotClient'
import Topology from './amqp/Topology'

class SwitchBoardOperator {

  operators: object = loadOperators()
  mergedConfig: object
  definedConfig: object
  topology: Topology
  rabbotClient: any
  public app: any

  constructor() {
    this.mergedConfig = Object.assign(config.get('topology'), {
      events: this.operators
    })

    this.topology = new Topology(new Config(this.mergedConfig))
    this.definedConfig = new Config(
      config.util.toObject(this.mergedConfig)
    )

    this.rabbotClient = new RabbotClient(
      rabbit,
      this.topology.getTopology(),
      this.operators
    )

    if (process.env.NODE_ENV !== 'test') {
      this.rabbotClient.start()
    }

    const app = express()

    app.use(express.static('public'))

    app.set('views', __dirname + '/templates')
    // Nunjucks config
    expressNunjucks(app, {
      watch: false,
      noCache: true
    })
    app.use('/diagrams', express.static(
      path.join(
        __dirname,
        'node_modules/storm-react-diagrams/dist'
      )
    ))

    // Adding healthchecks
    app.use('/status', require('express-healthcheck')())

    app.get('/topology', (req, res) => {
      let topology = {
        events: this.operators,
        tasks: config.get('topology.tasks')
      }
      res.render('topology', {
        topology: JSON.stringify(topology)
      })
    })

    app.listen(3000, () => {
      logger.info('SwitchBoard Operator listening on port 3000!')
    })

    this.app = app
  }

}

const app = new SwitchBoardOperator()

export default app

process.on('unhandledRejection', (reason, p) => {
  // application specific logging, throwing an error, or other logic here
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})
