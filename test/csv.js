const assert = require('assert');
const csv = require("../utils/csv");
const file = require("../utils/file");


describe('csv', function() {
  describe('#readCSV()', function() {
    it('read file', async function() {
      const expected = [
        {
          date: '12/15/2020',
          discountedPrice: 13.2,
          perfectPartnerPromotions: 'test2',
          regularPrice: 15,
          thresholdPromotions: 'test1',
          unitPrice: 13.2
        },
        {
          date: '12/16/2020',
          discountedPrice: 14,
          perfectPartnerPromotions: 'test2',
          regularPrice: 15,
          thresholdPromotions: 'test1',
          unitPrice: 14
        }
      ];
      assert.deepStrictEqual(await csv.readCSV("./test/file.csv"), expected);
    });
  });

  describe('#writeCSV()', function() {
    it('write file', async function() {
      const input = [
        {
          date: '12/15/2020',
          purchasable: true,
          bestPrice: '13.2',
          promotions: 'test2',
          regularPrice: '15',
          remarks: 'test1',
          unitPrice: '13.2'
        },
        {
          date: '12/16/2020',
          purchasable: false,
          bestPrice: '14',
          promotions: 'test2',
          regularPrice: '15',
          remarks: 'test1',
          unitPrice: '14'
        }
      ];
      const expected = 
      'Date,Purchasable,Regular Price,Best Price,Unit Price,Promotions,Remarks\n'+
      '12/15/2020,true,15.00,13.20,13.20,test2,test1\n'+
      '12/16/2020,false,15.00,14.00,14.00,test2,test1';

      await csv.writeCSV("./test/file-out.csv", input);
      const actual = await file.readFile("./test/file-out.csv");
      assert.deepStrictEqual(actual, expected);
    });
  });



  describe('Integration', function() {
    it('full cycle', async function() {
      const input = [
        {
          date: '12/15/2020',
          purchasable: "true",
          bestPrice: 13.2,
          promotions: 'test2',
          regularPrice: 15,
          remarks: 'test1',
          unitPrice: 13.2
        },
        {
          date: '12/16/2020',
          purchasable: "false",
          bestPrice: 14,
          promotions: 'test2',
          regularPrice: 15,
          remarks: 'test1',
          unitPrice: 14
        }
      ];
      await csv.writeCSV("./test/file-cycle.csv", input);
      const actual = await csv.readCSV("./test/file-cycle.csv")
      assert.deepStrictEqual(actual, input);
    });
  });
});