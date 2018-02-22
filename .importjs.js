module.exports = {
  declarationKeyword: 'const',
  importStatementFormatter({ importStatement }) {
    return importStatement.replace(/;$/, '');
  }
}
