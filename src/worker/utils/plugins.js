module.exports.extractModuleId = (file) => {
  return file.replace(/\.js$/, '')
}
