require('debug').log = console.log.bind(console);
const log = require('debug')('price-download');

const md = require("./untils/markdown");
const file = require("./untils/file");
const csv = require("./untils/csv");
const date = require("./untils/date");
const system = require("./untils/system");
const config = require("./untils/config").parseConfigWithTemplate("./config/config.yaml", "./config/template.yaml");

const argv = system.parseArgv();
const basePath = argv.dest || file.pathResolve("Data");


(async () => {
  const total = config.products.length;
  for await (const [i, product] of config.products.entries()) {
    const log = require('debug')(`price-download:${i + 1}`);
    log(`Processing ${product.name} [${i + 1}/${total}]`);
    try {
      await handleProduct(product, log) 
    } catch (e) {
      log(`Error while processing ${product.name}`);
      log(e)
    } finally {
      log(`End ${product.name} [${i + 1}/${total}]`);
    }
    await system.wait(5 * system.SEC);
  }
})();


async function handleProduct(product, log) {
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;

  const module = system.loadModule(product.source);
  if(!module) {
    log(`Cannot load module, quiting...`);
    return;
  }
  const onlineData = await module.retrieve(product);
  if(!onlineData) {
    log(`Empty data, quiting...`);
    return;
  }

  const folderPath = await file.createProductFolder(basePath, product.source, product.id, product.name);
  const specFilePath = file.join(folderPath, "Spec.md");
  const priceFilePath = file.join(folderPath, `${date.format("YYYYMM")}.csv`);

  // Spec
  {
    file.writeFile(specFilePath, md.object2mdTable(onlineData.static));
  }

  // Price
  {
    let historical = await csv.readCSV(priceFilePath);
    historical = historical.filter(e => e.date !== onlineData.price.date);
    historical.push(onlineData.price);
    await csv.writeCSV(priceFilePath, historical, {flag : "w"});
  }
}
