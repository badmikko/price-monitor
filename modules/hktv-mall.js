const axios = require('axios');
const date = require("../untils/date");
const md = require("../untils/markdown");
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

  
  function runUnitPriceFormula(formula, price, unit) {
    parser.setVariable('price', price);
    let obj = parser.parse(formula);
    if(obj.error) {
      return obj.error;
    }
    if(!obj.result) {
      return "";
    }
    let value = typeof obj.result === "string" ? parseFloat(obj.result) : obj.result;
    return value.toPrecision(2) + "/" + unit;
  }

  if(response.data.error) {
    return null;
  }
  

  var result = {
    static: {
      name: response.data.name,
      brandName: response.data.brandName, 
      storeName: response.data.storeName,
      packingSpec: response.data.packingSpec,
    },
    price: {}
  }
  
  result.price.date = date.format("YYYY-MM-DD")
  result.price.purchasable = response.data.purchasable;
  result.price.regularPrice = formatPrice(response.data.priceList?.filter(i => i.priceType == 'BUY')[0]?.formattedValue);
  result.price.discountedPrice = formatPrice(response.data.priceList?.filter(i => i.priceType == 'DISCOUNT')[0]?.formattedValue);
  result.price.lowestPrice = formatPrice(response.data.priceList.sort((a, b) => a.value - b.value)[0]?.formattedValue);
  result.price.unitPrice = runUnitPriceFormula(product['unit-convertsion'], result.price.discountedPrice || result.price.regularPrice, product.unit);

  const promotions = [];
  promotions.push(response.data.buyMoreSaveMore?.promotionLevels?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.message)}**`
  })));
  promotions.push(response.data.thresholdPromotionList?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.name)}**\n${md.html2md(i.description)}`
  })));
  promotions.push(response.data.perfectPartnerPromotionList?.map(i => ({
    startTime: i.startTime,
    message: `**${md.html2md(i.name)}**\n${md.html2md(i.description)}`
  })));
  result.price.promotions = promotions.filter(i => !!i).sort((a, b) => a.startTime - b.startTime).map(i => i.message);
  
  return result;
}

module.exports = {
  retrieve
}