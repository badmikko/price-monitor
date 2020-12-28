require('debug').log = console.log.bind(console);
const log = require('debug')('price-aggregator');

const md = require("./utils/markdown");
const file = require("./utils/file");
const csv = require("./utils/csv");
const date = require("./utils/date");
const system = require("./utils/system");
//const config = require("./utils/config").parseConfigWithTemplate("./config/config.yaml", "./config/template.yaml");
const config = require("./utils/config").parseConfigs("./config/");


const argv = system.parseArgv();
const basePath = argv.dest || file.pathResolve(".");
const baseDataPath = file.pathJoin(basePath, "data");
const baseDocsPath = file.pathJoin(basePath, "docs");

const timePeriod = config.app.timePeriod || 30;
const endDate = date.today();
const startDate = date.addDays(-(timePeriod - 1), endDate);
const monthsAcross = date.getAllMonthsBetween(startDate, endDate);
const datesAcross = date.getAllDatesBetween(startDate, endDate);
const datesAcrossInString = datesAcross.map(d => date.format("YYYY-MM-DD", d));

// Create doc folder if not exists
file.createFolder(baseDocsPath);

(async () => {
  const total = config.products.length;
  const table = [];
  for await (const [i, product] of config.products.entries()) {
    const log = require('debug')(`price-aggregator:${i + 1}`);
    log(`Processing ${product.name} [${i + 1}/${total}]`);
    try {
      const row = await handleProduct(product, log);
      if(!!row) {
        table.push(row);
      }
    } catch (e) {
      log(`Error while processing ${product.name}`);
      log(e)
    } finally {
      log(`End ${product.name} [${i + 1}/${total}]`);
    }
  }
  const allTags = [...new Set(table.map(row => row.tags).reduce((array, tags) => (array.push.apply(array, tags), array), []))]
    .map(tag => ({
      name: tag,
      color: config.tags.filter(i => i.name == tag)[0]?.color || 'blue'
    }))
    .sort((a, b) => a.color?.localeCompare(b.color));

  {
    const tableStringify = JSON.stringify(table, null, 2);
    const allTagsStringify = JSON.stringify(allTags, null, 2);

    const jsonFilePath = file.pathJoin(baseDocsPath, "data.json");
    file.writeFile(jsonFilePath, tableStringify);

    const tagFilePath = file.pathJoin(baseDocsPath, "tags.json");
    file.writeFile(tagFilePath, allTagsStringify);

    const jsFilePath = file.pathJoin(baseDocsPath, "data.js");
    file.writeFile(jsFilePath, `var tableData = ${tableStringify};
    var tags = ${allTagsStringify}`);
  }

  console.log("finished");
})();


async function handleProduct(product, log) {
  const folderPath = await file.createProductFolder(baseDataPath, product.source, product.id, product.name);
  const specFilePath = file.pathJoin(folderPath, "Spec.md");
  const priceFilePaths = monthsAcross.map(month => file.pathJoin(folderPath, `${date.format("YYYYMM", month)}.csv`));

  if(!file.fileExists(specFilePath)) {
    log("Missing spec file");
    return;
  }

  // Spec
  const spec = await (async function() {
    const content = await file.readFile(specFilePath);
    return md.mdTable2object(content);
  })();

  // Price
  const historical = await (async function() {
    const startDateNumber = dateToNumber(startDate);

    let list = [];
    for await (const priceFilePath of priceFilePaths) {
      if(file.fileExists(priceFilePath)) {
        list.push.apply(list, await csv.readCSV(priceFilePath));
      }
    }

    return list
      .map(i => {i.dateNumber = dateToNumber(i.date); return i;})
      .sort((a, b) => a.dateNumber - b.dateNumber)
      .filter(i => i.dateNumber >= startDateNumber)
      .map(i => {
        delete i.dateNumber; 
        i.unitPrice = i.unitPrice;
        return i;
      });

    function dateToNumber(d) {
      if(d == null) {
        return null;
      }
      try {
        if(typeof d === 'string') {
          return parseInt(d.replace(/[-\/]/g, ''));
        }
        return parseInt(date.format("YYYYMMDD", d))
      } catch {
        return null;
      }
    }
  })();

  const dataMap = historical.reduce((map, obj) => (map[obj.date] = obj, map), {})
  const historicalBestPrice = datesAcrossInString.map(s => {
    const row = dataMap[s];
    if(!row) {
      return null;
    }
    if(row.purchasable !== 'true') {
      return null;
    }
    return row?.unitPrice || null;
  });
  const [lowestPrice, lowestIndex] = min(historicalBestPrice);
  const lowestForDays = datesAcross.length - lowestIndex - 1;
  const lowestDate = datesAcross[lowestIndex];

  const result = {...spec, ...{
    historical: historicalBestPrice,
    lowestForDays, 
    tags: product.tags
  }};

  return result;

  function min(array) {
    let minValue = null;
    let minIndex = null;

    for (const [i, v] of array.entries()) {
      if(minValue == null) {
        minValue = v;
        minIndex = i;

        continue;
      }

      if(minValue == null) {
        continue;
      }

      if(v <= minValue) {
        minValue = v;
        minIndex = i;
      }
    }

    return [minValue, minIndex]
  }
}
