const axios = require('axios');
const date = require("../utils/date");
const md = require("../utils/markdown");
const FormulaParser = require('hot-formula-parser').Parser;

const options = { 
  headers: { 
    'User-Agent': 'HKTVMall/2.6.1 CFNetwork/1209 Darwin/20.2.0'
  }
} 

async function retrieve(product) {
  const log = require('debug')(`hktv-mall:${product.id}`);
  const parser = new FormulaParser();
  
  let response;
  try {
    response = await axios.get(`https://www.hktvmall.com/hktvwebservices/v1/hktv/get_product?product_id=${product.id}&lang=zh`, options);
  } catch(e) {
    log("no record on hktv-mall")
    return null;
  }
  log(`data downloaded`);
  //log(response.body);

  function escape(html) {
    return html.replace(/\|/g, '\\|');
  }

  function formatPrice(html) {
    return html?.replace(/^\$\s+/g, '');
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
    return value.toPrecision(2);
  }

  if(response.data.error) {
    return null;
  }
  

  var result = {
    static: {
      name: response.data.name,
      brandName: response.data.brandName, 
      storeName: `HKTVMall - ${response.data.storeName}`,
      packingSpec: response.data.packingSpec,
    },
    price: {}
  }
  
  result.price.date = date.format("YYYY-MM-DD")
  result.price.purchasable = response.data.purchasable;
  result.price.regularPrice = formatPrice(response.data.priceList?.filter(i => i.priceType == 'BUY')[0]?.formattedValue);
  result.price.bestPrice = formatPrice(response.data.priceList?.filter(i => i.priceType == 'DISCOUNT')[0]?.formattedValue) || result.price.regularPrice;
  //result.price.lowestPrice = formatPrice(response.data.priceList.sort((a, b) => a.value - b.value)[0]?.formattedValue);
  
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

  const promotions = [];
  promotions.push.apply(promotions, response.data.buyMoreSaveMore?.promotionLevels?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.message)}**`
  })));
  promotions.push.apply(promotions, response.data.thresholdPromotionList?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.name)}**\n${md.html2md(i.description)}`
  })));
  promotions.push.apply(promotions, response.data.perfectPartnerPromotionList?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.name)}**\n${md.html2md(i.description)}`
  })));
  result.price.promotions = promotions.filter(i => !!i).sort((a, b) => a.startTime - b.startTime).map(i => i.message).join("\n");
  
  return result;
}

module.exports = {
  retrieve
}