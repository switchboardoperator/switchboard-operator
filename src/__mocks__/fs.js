const path = require('path')

const fs = jest.genMockFromModule('fs')

console.log('MOOOOOOOOOOCK LOOOOAAAADEEED')

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null)
let dirContents = Object.create(null)
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null)
  for (const file in newMockFiles) {
    const dir = path.dirname(file)

    if (!mockFiles[dir]) {
      mockFiles[dir] = []
    }
    mockFiles[dir].push(path.basename(file))
  }
}

function __setDirsContents(contents) {
  dirContents = contents
}

// A custom version of `readFileSync` that reads from the special mocked out
// file list set via __setMockFiles
function readFileSync(filePath) {
  let contents = ''

  Object.keys(mockFiles).forEach((file) => {
    const fileRE = new RegExp(file)

    if (fileRE.test(filePath)) {
      console.log('Returning file contents...', mockFiles[file])
      return contents = mockFiles[file]
    }
  })

  return contents
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setDirsContents
function readdirSync(directoryPath) {
  let contents = []

  Object.keys(dirContents).forEach((dir) => {
    const dirRegEx = new RegExp(dir)

    if (dirRegEx.test(directoryPath)) {
      return contents = dirContents[dir]
    }
  })

  return contents
}

fs.__setMockFiles = __setMockFiles
fs.__setDirsContents = __setDirsContents
fs.readFileSync = readFileSync
fs.readdirSync = readdirSync

module.exports = fs
