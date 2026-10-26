const fs = require('fs')
const { execFileSync } = require('child_process')

const COMMENT = { py: /^\s*#/, go: /^\s*(\/\/|\/\*|\*)/, ts: /^\s*(\/\/|\/\*|\*)/ }
const LANGS = {
  py: {
    tests: [/^\s*(?:async\s+)?def\s+(?<name>test\w*)\s*\(/],
    skip: /@pytest\.mark\.(?:skip|skipif|xfail)\b|\bpytest\.(?:skip|xfail)\(|@unittest\.(?:skip|skipIf|skipUnless|expectedFailure)\b|\bself\.skipTest\(/,
    only: null,
    assertion: /^\s*assert\b|\bself\.assert\w+\(|\bpytest\.raises\(|\.assert_\w+\(/,
    strict: /==|\bassert(?:Equal|ListEqual|DictEqual|SequenceEqual|AlmostEqual|Is|IsNone)\b|\.assert_(?:called_with|called_once_with|not_called)\b/,
    loose: /\bis not None\b|[<>]=?|\bassert(?:True|False|IsNotNone|In|Greater\w*|Less\w*|Regex)\b|\bin\b|\bassert\s+[\w.()]+\s*$/,
  },
  go: {
    tests: [/^func\s+(?<name>(?:Test|Benchmark|Fuzz)\w*)\(/, /\bt\.Run\(\s*"(?<name>[^"]+)"/],
    skip: /\b[tb]\.Skip(?:f|Now)?\(/,
    only: null,
    assertion: /\b[tb]\.(?:Error|Errorf|Fatal|Fatalf|Fail|FailNow)\(|\b(?:assert|require)\.\w+\(/,
    strict: /\b(?:assert|require)\.(?:Equal\w*|JSONEq|YAMLEq|Exactly|NoError|ErrorIs|ErrorContains|Nil|Zero|Empty)\(/,
    loose: /\b(?:assert|require)\.(?:NotNil|NotEmpty|True|False|Contains|Greater\w*|Less\w*|InDelta|InEpsilon|Condition|Positive|Negative|Error|NotZero|Len)\(/,
  },
  ts: {
    tests: [
      /\b(?:it|test)(?:\.(?:skip|only|concurrent|todo|fails))*\(\s*(?<q>['"`])(?<name>.+?)\k<q>/,
      /\b(?:xit|xtest|fit)\(\s*(?<q>['"`])(?<name>.+?)\k<q>/,
    ],
    skip: /\b(?:it|test|describe)\.(?:skip|todo|fixme)\b|\b(?:xit|xtest|xdescribe)\(/,
    only: /\b(?:it|test|describe)\.only\b|\b(?:fit|fdescribe)\(/,
    assertion: /\bexpect\(|\bassert(?:\.\w+)?\(/,
    strict: /\.(?:toBe|toEqual|toStrictEqual|toHaveBeenCalledWith|toHaveBeenNthCalledWith|toMatchInlineSnapshot|toBeNull|toBeUndefined|toHaveLength|toHaveProperty)\(|\bassert\.(?:strictEqual|deepStrictEqual|equal)\(/,
    loose: /\.(?:toBeTruthy|toBeFalsy|toBeDefined|toContain\w*|toBeGreaterThan\w*|toBeLessThan\w*|toBeCloseTo|toMatch|toBeInstanceOf|toHaveBeenCalled|toThrow)\(|\bexpect\.(?:any|anything)\(|\bassert\.ok\(/,
  },
}

const TEST_FILE = /(^|\/)(tests?|__tests__)\/|(^|\/)test_[^/]*\.py$|_test\.(py|go)$|\.(test|spec)\.[cm]?[jt]sx?$/

function langOf(file) {
  if (!TEST_FILE.test(file)) return null
  if (/\.py$/.test(file)) return 'py'
  if (/\.go$/.test(file)) return 'go'
  if (/\.[cm]?[jt]sx?$/.test(file)) return 'ts'
  return null
}

function profile(lang, text) {
  const cfg = LANGS[lang]
  const p = { names: new Map(), skips: 0, onlys: 0, assertions: 0, strict: 0, loose: 0 }
  for (const line of text.split(/\r?\n/).filter(l => !COMMENT[lang].test(l))) {
    for (const re of cfg.tests) {
      const m = re.exec(line)
      if (m) p.names.set(m.groups.name, (p.names.get(m.groups.name) || 0) + 1)
    }
    if (cfg.skip.test(line)) p.skips++
    if (cfg.only && cfg.only.test(line)) p.onlys++
    if (cfg.assertion.test(line)) {
      p.assertions++
      if (cfg.strict.test(line)) p.strict++
      else if (cfg.loose.test(line)) p.loose++
    }
  }
  return p
}

function droppedNames(before, after) {
  const out = []
  for (const [name, n] of before.names) {
    const left = n - (after.names.get(name) || 0)
    for (let i = 0; i < left; i++) out.push(name)
  }
  return out
}

function analyze(lang, beforeText, afterText) {
  const before = profile(lang, beforeText)
  if (afterText === null) {
    const names = droppedNames(before, profile(lang, ''))
    return [['DELETED_FILE', `${names.length} tests: ${names.join(', ')}`]]
  }
  const after = profile(lang, afterText)
  const findings = droppedNames(before, after).map(n => ['DROPPED_TEST', n])
  if (after.skips > before.skips) findings.push(['SKIP_ADDED', `${before.skips} -> ${after.skips}`])
  if (after.onlys > before.onlys) findings.push(['ONLY_ADDED', `${before.onlys} -> ${after.onlys}`])
  if (after.assertions < before.assertions) findings.push(['ASSERTS_LOST', `${before.assertions} -> ${after.assertions}`])
  if (after.loose > before.loose && after.strict < before.strict) {
    findings.push(['LOOSENED', `strict ${before.strict} -> ${after.strict}, loose ${before.loose} -> ${after.loose}`])
  }
  return findings
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] })
}

function changedPairs(base) {
  const pairs = []
  for (const row of git(['diff', '--name-status', '-M', '--relative', base]).split(/\r?\n/).filter(Boolean)) {
    const [status, from, to] = row.split('\t')
    if (status !== 'A') pairs.push({ from, to: to || from })
  }
  return pairs
}

function audit(base) {
  const rows = []
  for (const { from, to } of changedPairs(base)) {
    const lang = langOf(from)
    if (!lang) continue
    const after = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : null
    for (const [kind, detail] of analyze(lang, git(['show', `${base}:./${from}`]), after)) rows.push([to, kind, detail])
  }
  return rows
}

function main(argv) {
  const rows = audit(argv[2])
  for (const r of rows) console.log(r.join('\t'))
  return rows.length ? 1 : 0
}

if (require.main === module) process.exitCode = main(process.argv)
module.exports = { analyze, langOf }
