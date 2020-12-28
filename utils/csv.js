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
// https://c2fo.io/fast-csv/docs/formatting/getting-started
const { format } = require('@fast-csv/format');

async function writeCSV(filePath, records, options = {}) {
  const defaultOptions = {
    encoding: "utf-8",
    flag: "a"
  };
  let mergedOptions = {...defaultOptions, ...options};

  return new Promise((resolve, reject) => {
    const csvStream = format({ 
      headers: CURRENT_HEADER.map(row => row.title) 
    })
    .transform(function(obj) {
      return Object
        .entries(obj)
        .map(row => {
          if(row[0].endsWith("Price")) { 
            row[1] = parseFloat(row[1]).toFixed(2); 
          }
          row[0] = CURRENT_HEADER.filter(h => h.id === row[0])[0]?.title || row[0];
          return row
        })
        .reduce((map, obj) => (map[obj[0]] = obj[1], map), {});
    });

    const writableStream = fs.createWriteStream(filePath)
      .on('finish', () => resolve(null))
      .on('error', (e) => reject(e));

    csvStream.pipe(writableStream);
    for(let record of records) {
      csvStream.write(record);
    }
    csvStream.end();
  });
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
  readCSV,
  writeCSV
}
