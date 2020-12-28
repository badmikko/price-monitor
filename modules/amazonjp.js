const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const FormulaParser = require('hot-formula-parser').Parser;

const date = require("../utils/date");

const resourceLoader = new jsdom.ResourceLoader({
//  proxy: "http://127.0.0.1:9001",
  strictSSL: false,
  userAgent: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
});
const options = { 
  cookieJar: new jsdom.CookieJar(), 
  resources: resourceLoader,
  pretendToBeVisual: true,
  virtualConsole: new jsdom.VirtualConsole(),
}

async function retrieve(product) {
  const log = require('debug')(`amazonjp:${product.id}`);
  const parser = new FormulaParser();
  
  const url = `https://www.amazon.co.jp/-/en/dp/${product.id}`;
  const dom = await JSDOM.fromURL(url, options);

  log(`data downloaded`);
  //log(dom.serialize());

  var result = {
    static: {
      packingSpec: null,
      link: `https://www.amazon.co.jp/-/en/dp/${product.id}`
    },
    price: {}
  }

  //var price = dom.window.document.querySelector("div.price span")?.innerHTML
  result.static.name = dom.window.document.querySelector("#productTitle")?.innerHTML?.trim() || null;
  result.static.brandName = dom.window.document.querySelector("#bylineInfo")?.innerHTML?.trim().replace(/^Brand: /, '') || null;
  result.static.storeName = [
      "Amazon JP", 
      dom.window.document.evaluate(`//table//span[contains(text(), 'Sold by')]//ancestor::tr//td[@class = "tabular-buybox-column"]//span[contains(@class, "a-truncate-full")]/descendant::*/text() | //div[@id="merchant-info"]/descendant::*/text()`, dom.window.document, null, 0, null)?.iterateNext()?.wholeText || null
    ].filter(i => !!i).join(" - ");
  
  result.price.date = date.format("YYYY-MM-DD")
  result.price.purchasable = !dom.window.document.querySelector("#outOfStock")?.innerHTML;
  result.price.bestPrice = formatPrice(dom.window.document.querySelector("#price_inside_buybox, #priceblock_dealprice, #priceblock_ourprice, span.offer-price")?.innerHTML?.trim());
  result.price.regularPrice = formatPrice(dom.window.document.querySelector("span.priceBlockStrikePriceString")?.innerHTML?.trim()) || result.price.bestPrice;

  if(!!product['unit-convertsion']) {
    result.price.unitPrice = runUnitPriceFormula(product['unit-convertsion'], result.price.bestPrice);
  } else {
    result.price.unitPrice = result.price.bestPrice;
  }

  // Update Static Page
  result.static.purchasable = result.price.purchasable;
  result.static.regularPrice = result.price.regularPrice;
  result.static.bestPrice = result.price.bestPrice;
  result.static.unitPrice = result.price.unitPrice;
  result.static.unitPriceUnit = product.unit;

  //var seller = dom.window.document.evaluate(`//table//span[contains(text(), 'Sold by')]//ancestor::tr//td[@class = "tabular-buybox-column"]//span[contains(@class, "a-truncate-full")] | //div[@id="merchant-info"]/a`, dom.window.document, null, 0, null)?.iterateNext()?.innerText;
  console.log(`name: ${product.name}, bestPrice: ${result.price.bestPrice}, regularPrice: ${result.price.regularPrice}, purchasable: ${result.price.purchasable}, seller: ${result.static.storeName}`);

  return result;


  function formatPrice(html) {
    return html?.replace(/[$¥,]/g, '') || null;
  }

  
  function runUnitPriceFormula(formula, price) {
    parser.setVariable('price', price);
    let obj = parser.parse(formula);
    if(obj.error) {
      return obj.error;
    }
    if(!obj.result) {
      return "";
    }
    let value = typeof obj.result === "string" ? parseFloat(obj.result) : obj.result;
    return value.toFixed(2);
  }
}

module.exports = {
  retrieve
}