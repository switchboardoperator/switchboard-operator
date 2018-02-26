const config = require('config')
const express = require('express')
const expressNunjucks = require('express-nunjucks')
const logger = require('winston')
const rabbit = require('rabbot')

const path = require('path')

const { loadOperators } = require('./src/utils/operators-loader')
const ConfigSchema = require('./src/model/config-schema')
const RabbotClient = require('./src/amqp/rabbot')
const Topology = require('./src/amqp/topology')

const operators = loadOperators()

const mergedConfig = Object.assign(config.get('topology'), {
  events: operators
})

const topology = new Topology(mergedConfig)

const definedConfig = new ConfigSchema(
  config.util.toObject(mergedConfig)
)

if (definedConfig.isErrors()) {
  logger.error('The topology defined has errors %j', definedConfig.getErrors())
} else {
  logger.info('Config validated, no errors found')
}

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

app.listen(3000, function () {
  logger.info('SwitchBoard Operator listening on port 3000!')
})

process.on('unhandledRejection', (reason, p) => {
  // application specific logging, throwing an error, or other logic here
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

module.exports.app = app
