const fs = require('fs')
const yaml = require('js-yaml')

const operatorsDir = __dirname + '/../../operators'

const loadOperatorFiles = () => {
  const files = fs.readdirSync(operatorsDir)
  return files
}

module.exports.loadOperators = () => {
  const operators = []
  const operatorFiles = loadOperatorFiles()

  operatorFiles.forEach((operatorYaml) => {
    const fileContents = fs.readFileSync(
      operatorsDir + '/' + operatorYaml,
      'utf8'
    )
    const doc = yaml.safeLoad(fileContents)
    operators.push(doc)
  })

  return operators
}
