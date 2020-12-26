const fs = require('fs')

const CURRENT_HEADER = [
  {id: 'date', title: 'Date'},
  {id: 'purchasable', title: 'Purchasable'},
  {id: 'regularPrice', title: 'Regular Price'},
  {id: 'bestPrice', title: 'Best Price'},
  {id: 'unitPrice', title: 'Unit Price'},
  {id: 'promotions', title: 'Promotions'},
  {id: 'remarks', title: 'Remarks'}
];

const OLD_HEADER = [
  ...CURRENT_HEADER, 
  {id: 'thresholdPromotions', title: 'Threshold Promotions'},
  {id: 'perfectPartnerPromotions', title: 'Perfect Partner Promotions'},
  {id: 'discountedPrice', title: 'Discounted Price'}
];

// CSV -> JSON
// https://www.npmjs.com/package/csv-parser
const csvParser = require('csv-parser');

// JSON -> CSV
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const csvStringifier = createCsvStringifier({
  header: CURRENT_HEADER
});

 
function getHeader() {
  return csvStringifier.getHeaderString()
}

function getRow(records) {
  return csvStringifier.stringifyRecords(records);
}

async function writeCSV(filePath, records, options = {}) {
  const defaultOptions = {
    encoding: "utf-8",
    flag: "a"
  };
  let mergedOptions = {...defaultOptions, ...options};

  let content = getRow(records)
  if (!fs.existsSync(filePath) || mergedOptions.flag === "w") {
    content = getHeader() + content;
  }
  await fs.promises.writeFile(filePath, content, mergedOptions);
}

async function readCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({
        mapHeaders: ({ header, index }) => {
          return OLD_HEADER.filter(i => i.title == header)?.[0]?.id || header
        },
        mapValues: ({ header, index, value }) => {
          if(header.endsWith("Price")) {
            return parseFloat(value);
          }
          return value;
        }
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (e) => reject(e));
  });
}

module.exports = {
  getHeader,
  getRow,
  readCSV,
  writeCSV
}
