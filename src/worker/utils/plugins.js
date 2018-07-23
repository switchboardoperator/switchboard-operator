module.exports.extractModuleId = (file) => {
  return file.replace(/\.ts$/, '')
}
