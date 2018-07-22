import path = require('path')
import config from 'config'
import express from 'express'
import expressNunjucks from 'express-nunjucks'
import logger from 'winston'
import rabbit from 'rabbot'

import { loadOperators } from './src/services/OperatorsLoader'
import Config from './src/model/Config'
import RabbotClient from './src/amqp/RabbotClient'
import Topology from './src/amqp/Topology'

const operators = loadOperators()

const mergedConfig = { ...config.get('topology'), {
  events: operators
}}

const topology = new Topology(mergedConfig)

const definedConfig = new Config(
  config.util.toObject(mergedConfig)
)

const rabbotClient = new RabbotClient(
  rabbit,
  topology.getTopology(),
  operators
)

if (process.env.NODE_ENV !== 'test') {
  rabbotClient.start()
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
    events: operators,
    tasks: config.get('topology.tasks')
  }
  res.render('topology', {
    topology: JSON.stringify(topology)
  })
})

app.listen(3000, () => {
  logger.info('SwitchBoard Operator listening on port 3000!')
})

process.on('unhandledRejection', (reason, p) => {
  // application specific logging, throwing an error, or other logic here
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

export default app
