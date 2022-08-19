// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("rescript/lib/js/curry.js");
var StdLib = require("./StdLib.bs.js");

function get(key) {
  return Curry._2(StdLib.Dict.get, process.env, key);
}

function getExn(key) {
  return Curry._1(StdLib.O.getExn, Curry._2(StdLib.Dict.get, process.env, key));
}

exports.get = get;
exports.getExn = getExn;
/* StdLib Not a pure module */
