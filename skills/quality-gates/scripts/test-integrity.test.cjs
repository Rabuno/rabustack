const test = require('node:test')
const assert = require('node:assert/strict')
const { analyze, langOf } = require('./test-integrity.cjs')

const kinds = (lang, a, b) => analyze(lang, a, b).map(f => f[0])

test('langOf recognises test files only', () => {
  assert.equal(langOf('pkg/test_a.py'), 'py')
  assert.equal(langOf('pkg/a_test.go'), 'go')
  assert.equal(langOf('src/a.spec.ts'), 'ts')
  assert.equal(langOf('src/a.ts'), null)
})

const PY = 'def test_a():\n    assert f(1) == 2\n\ndef test_b():\n    assert f(2) == 3\n'
test('python', () => {
  assert.deepEqual(kinds('py', PY, PY), [])
  assert.deepEqual(kinds('py', PY, PY + '\ndef test_c():\n    assert f(3) == 4\n'), [])
  assert.deepEqual(kinds('py', PY, null), ['DELETED_FILE'])
  assert.deepEqual(kinds('py', PY, 'def test_a():\n    assert f(1) == 2\n'), ['DROPPED_TEST', 'ASSERTS_LOST'])
  assert.deepEqual(kinds('py', PY, PY.replace('def test_b', '@pytest.mark.skip\ndef test_b')), ['SKIP_ADDED'])
  assert.deepEqual(kinds('py', PY, PY.replace('    assert f(2) == 3\n', '')), ['ASSERTS_LOST'])
  assert.deepEqual(kinds('py', PY, PY.replace('f(2) == 3', 'f(2) >= 3')), ['LOOSENED'])
  assert.deepEqual(kinds('py', PY, PY.replace('def test_b', '# def test_b')), ['DROPPED_TEST'])
})

const GO =
  'func TestA(t *testing.T) {\n\tif f(1) != 2 {\n\t\tt.Errorf("bad")\n\t}\n' +
  '\tt.Run("sub", func(t *testing.T) {\n\t\tassert.Equal(t, 3, f(2))\n\t})\n}\n'
test('go', () => {
  assert.deepEqual(kinds('go', GO, GO), [])
  assert.deepEqual(kinds('go', GO, GO.replace('func TestA', 'func TestA2')), ['DROPPED_TEST'])
  assert.deepEqual(kinds('go', GO, GO.replace('\tt.Run(', '\tt.Skip("x")\n\tt.Run(')), ['SKIP_ADDED'])
  assert.deepEqual(kinds('go', GO, GO.replace('assert.Equal(t, 3, f(2))', 'assert.NotNil(t, f(2))')), ['LOOSENED'])
  assert.deepEqual(kinds('go', GO, GO.replace('\t\tassert.Equal(t, 3, f(2))\n', '')), ['ASSERTS_LOST'])
  assert.deepEqual(kinds('go', GO, null), ['DELETED_FILE'])
})

const TS = "it('a', () => {\n  expect(f(1)).toBe(2)\n})\ntest('b', () => {\n  expect(f(2)).toEqual({ x: 1 })\n})\n"
test('typescript', () => {
  assert.deepEqual(kinds('ts', TS, TS), [])
  assert.deepEqual(kinds('ts', TS, TS.replace("it('a'", "it.skip('a'")), ['SKIP_ADDED'])
  assert.deepEqual(kinds('ts', TS, TS.replace("it('a'", "xit('a'")), ['SKIP_ADDED'])
  assert.deepEqual(kinds('ts', TS, TS.replace("test('b'", "test.only('b'")), ['ONLY_ADDED'])
  assert.deepEqual(kinds('ts', TS, TS.replace('toBe(2)', 'toBeTruthy()')), ['LOOSENED'])
  assert.deepEqual(kinds('ts', TS, TS.replace("test('b'", "test('b2'")), ['DROPPED_TEST'])
  assert.deepEqual(kinds('ts', TS, TS.replace('  expect(f(2)).toEqual({ x: 1 })\n', '')), ['ASSERTS_LOST'])
  assert.deepEqual(kinds('ts', TS, null), ['DELETED_FILE'])
})
