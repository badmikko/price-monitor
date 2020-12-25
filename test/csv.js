const assert = require('assert');
const csv = require("../untils/csv");


describe('csv', function() {
  describe('#readCSV()', function() {
    it('read file', async function() {
      const expected = [
        {
          date: '12/15/2020',
          discountedPrice: '13.2',
          perfectPartnerPromotions: 'test2',
          regularPrice: '15',
          thresholdPromotions: 'test1',
          unitPrice: '13.2'
        },
        {
          date: '12/16/2020',
          discountedPrice: '14',
          perfectPartnerPromotions: 'test2',
          regularPrice: '15',
          thresholdPromotions: 'test1',
          unitPrice: '14'
        }
      ];
      assert.deepStrictEqual(await csv.readCSV("./test/file.csv"), expected);
    });
  });
});