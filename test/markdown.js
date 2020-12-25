const assert = require('assert');
const md = require("../untils/markdown");


describe('markdown', function() {
  describe('#array2mdTable()', function() {
    it('simple convert', function() {
      const input = [
        {'one': 1, 'two': 2, 'three': 3},
        {'one': 1, 'two': 2, 'three': 3}
      ];
      const expected = 
      '| One   | Two   | Three |\n' +
      '| ----- | ----- | ----- |\n' +
      '| 1     | 2     | 3     |\n' +
      '| 1     | 2     | 3     |\n'
      assert.strictEqual(md.array2mdTable(input), expected);
    });
  });

  describe('#mdTable2array()', function() {
    it('simple convert', function() {
      const expected = [
        {'one': '1', 'two': '2', 'three': '3'},
        {'one': '1', 'two': '2', 'three': '3'}
      ];
      const input = 
      '| one   | two   | three |\n' +
      '| ----- | ----- | ----- |\n' +
      '| 1     | 2     | 3     |\n' +
      '| 1     | 2     | 3     |\n'
      assert.deepStrictEqual(md.mdTable2array(input), expected);
    });
  });
});