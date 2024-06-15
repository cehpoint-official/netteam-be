const express = require("express");
const route = express.Router();

const FlagController = require("./flag.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//get commission
route.get("/", checkAccessWithSecretKey(), FlagController.index);

module.exports = route;
