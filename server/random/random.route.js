const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const RandomController = require("./random.controller");

//get random match
route.get("/match", checkAccessWithSecretKey(), RandomController.match);

module.exports = route;
