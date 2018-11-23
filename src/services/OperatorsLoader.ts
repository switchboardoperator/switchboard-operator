const fs = require('fs')
const yaml = require('js-yaml')

const operatorsDir = process.env.OPERATORS_DIR || __dirname + '/../../operators'

// List all operator files detected
const loadOperatorFiles = () => {
  const files = fs.readdirSync(operatorsDir)
  return files
}

// Load operators from yaml files
export const loadOperators = () => {
  const operators = []
  const operatorFiles = loadOperatorFiles()

  operatorFiles.forEach((operatorYaml) => {
    const fileContents = fs.readFileSync(
      operatorsDir + '/' + operatorYaml,
      'utf8'
    )
    const doc = yaml.safeLoad(fileContents)
    if (!doc) {
      return
    }
    if (doc.enabled === undefined || doc.enabled !== false) {
      operators.push(doc)
    }
  })

  return operators
}
