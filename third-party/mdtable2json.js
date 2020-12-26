"use strict";

var _ = require("lodash");
var fromMarkdown = require('mdast-util-from-markdown');
var toMarkdown = require('mdast-util-to-markdown');
var syntax = require('micromark-extension-gfm-table');
var table = require('mdast-util-gfm-table');

function tableToJson(t) {
    var headerCellArray = t.children[0].children;
    var headers = _.map(headerCellArray, function (it) {
      return toMarkdown(it, {extensions: [table.toMarkdown()]}).trim()
    });
    // Remove head
    t.children.splice(0, 1);
    var matrix = _.map(t.children, function (row) {
        return _.map(row.children, function (cell) {
            if (!_.isUndefined(cell.children[0])) {
              return toMarkdown(cell, {extensions: [table.toMarkdown()]}).trim()
            } else {
                return "";
            }
        });
    });
    var json = _.map(matrix, function (row) {
        var o = {};
        _.map(row, function (cell, index) {
            o[headers[index]] = cell;
        });
        return o;
    });
    return {
        headers: headers, json: json
    };
}

function getTables(string) {
    var tokens = fromMarkdown(string, {
      extensions: [syntax],
      mdastExtensions: [table.fromMarkdown]
    });
    return _.map(_.filter(tokens.children, function (it) {
        return it.type === "table";
    }), tableToJson);
}

module.exports = { getTables: getTables, tableToJson: tableToJson };