//express
const express = require("express");
const route = express.Router();

//controller
const DashboardController = require("./dashboard.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../checkAccess");

//get Admin Panel Dashboard
route.get("/admin", checkAccessWithSecretKey(), DashboardController.dashboard);

//get date Wise analytic for admin panel
route.get(
  "/analyitc",
  checkAccessWithSecretKey(),
  DashboardController.analytic
);

module.exports = route;
