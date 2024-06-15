const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const RandomMatchController = require("./randomHistory.controller");

//get randomMatch history for user
route.get(
  "/",
  checkAccessWithSecretKey(),
  RandomMatchController.hostMatchHistory
);

//get randomMatch history for host
route.get(
  "/randomHistory",
  checkAccessWithSecretKey(),
  RandomMatchController.userMatchHistory
);

module.exports = route;
