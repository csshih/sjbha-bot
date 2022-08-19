// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("rescript/lib/js/curry.js");
var MongoDb = require("../app/MongoDb");

var Collection = {};

function get(prim) {
  return MongoDb.getDb();
}

var Db = {
  get: get
};

function withDatabase(f) {
  return MongoDb.getDb().then(Curry.__1(f));
}

exports.Collection = Collection;
exports.Db = Db;
exports.withDatabase = withDatabase;
/* ../app/MongoDb Not a pure module */