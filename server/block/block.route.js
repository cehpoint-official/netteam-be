const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//Controller
const BlockController = require("./block.controller");

//block unblock User or Host
route.post(
  "/blockUnblock",
  checkAccessWithSecretKey(),
  BlockController.blockUnblock
);

//get Block List of user or host
route.get(
  "/block",
  checkAccessWithSecretKey(),
  BlockController.getBlockUserHost
);

module.exports = route;
