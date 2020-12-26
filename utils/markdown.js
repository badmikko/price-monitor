const TurndownService = require('turndown');
const turndownService = new TurndownService();

// https://github.com/citycide/tablemark
const tablemark = require('tablemark')

// https://github.com/vzaccaria/mdtable2json
var mdtable2json = require('mdtable2json')

const KEY_NAME = "Label";
const VALUE_NAME = "Value";

const CURRENT_HEADER = [
  {id: 'name', title: 'Name'},
  {id: 'brandName', title: 'Brand Name'},
  {id: 'storeName', title: 'Store Name'},
  {id: 'packingSpec', title: 'Packing Spec'},
  {id: 'regularPrice', title: 'Regular Price'},
  {id: 'bestPrice', title: 'Best Price'},
  {id: 'unitPrice', title: 'Unit Price'},
  {id: 'unitPriceUnit', title: 'Unit Price Unit'}
];

const OLD_HEADER = [
  ...CURRENT_HEADER, 
];

function html2md(html) {
  return turndownService.turndown(html);
}

function object2mdTable(obj) {
  const array = Object.entries(obj).map(x => {
    x[0] = CURRENT_HEADER.filter(i => i.id == x[0])?.[0]?.title || x[0];
    return x
  });
  return array2mdTable(array, {
    columns: [KEY_NAME, VALUE_NAME]
  });
}

function array2mdTable(array, options) {
  const defaultOptions = {};
  let mergedOptions = {...defaultOptions, ...options};
  return tablemark(array, mergedOptions)
}


function mdTable2array(content) {
  return mdtable2json.getTables(content)[0].json;
}

function mdTable2object(content) {
  const array1 = mdTable2array(content);
  const array2 = array1.reduce((map, obj) => (map[lookup(obj[KEY_NAME])] = obj[VALUE_NAME], map), {})
  return array2;

  function lookup(header) {
    return OLD_HEADER.filter(i => i.title == header)?.[0]?.id || header;
  }
}

module.exports = {
  html2md,
  object2mdTable,
  array2mdTable,
  mdTable2array,
  mdTable2object
}