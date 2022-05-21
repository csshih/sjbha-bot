// Generated by ReScript, PLEASE EDIT WITH CARE
'use strict';

var Pong = require("./commands/pong/Pong.bs.js");
var Curry = require("rescript/lib/js/curry.js");
var Belt_List = require("rescript/lib/js/belt_List.js");

function run(message) {
  var request = Belt_List.fromArray(message.content.split(" "));
  var command;
  var exit = 0;
  if (request && request.hd === "!pong" && !request.tl) {
    command = Pong.pong;
  } else {
    exit = 1;
  }
  if (exit === 1) {
    command = (function (prim) {
        
      });
  }
  return Curry._1(command, message);
}

exports.run = run;
/* No side effect */
