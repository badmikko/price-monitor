const TurndownService = require('turndown');
const turndownService = new TurndownService();

// https://github.com/citycide/tablemark
const tablemark = require('tablemark')

// https://github.com/vzaccaria/mdtable2json
var mdtable2json = require('mdtable2json')


function html2md(html) {
  return turndownService.turndown(html);
}

function object2mdTable(obj) {
  const array = Object.entries(obj);
  return array2mdTable(array, {
    columns: [
      'Label',
      'Value'
    ]
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
  const array2 = array1.map(o => [o.label, o.value]);
  return array2;
}

module.exports = {
  html2md,
  object2mdTable,
  array2mdTable,
  mdTable2array,
  mdTable2object
}