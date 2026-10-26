// Reads TS/JS file paths from stdin, one per line; prints "file<TAB>name<TAB>start<TAB>end" for each
// named function, method and function-valued variable. Uses the project's own typescript package.
const fs = require('fs')
const ts = require(require.resolve('typescript', { paths: [process.cwd()] }))
for (const f of fs.readFileSync(0, 'utf8').split(/\r?\n/).filter(Boolean)) {
  const src = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true)
  const line = pos => src.getLineAndCharacterOfPosition(pos).line + 1
  const visit = n => {
    let name
    if ((ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) && n.name) name = n.name.getText(src)
    if (ts.isVariableDeclaration(n) && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) name = n.name.getText(src)
    if (name) console.log([f, name, line(n.getStart(src)), line(n.getEnd())].join('\t'))
    ts.forEachChild(n, visit)
  }
  visit(src)
}
