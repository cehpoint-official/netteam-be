const express = require("express");
const route = express.Router();

const HistoryController = require("./history.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//history for admin panel
route.get(
  "/historyForUser",
  checkAccessWithSecretKey(),
  HistoryController.historyAdmin
);

//userDebit
route.get(
  "/userDebit",
  checkAccessWithSecretKey(),
  HistoryController.userDebit
);

//adminCoinHistory
route.get(
  "/adminCoinHistory",
  checkAccessWithSecretKey(),
  HistoryController.adminCoinHistory
);
//adminCoinHistory
route.get(
  "/purchaseCoinHistory",
  checkAccessWithSecretKey(),
  HistoryController.purchaseCoinHistory
);

//make Call API
route.post("/makeCall", checkAccessWithSecretKey(), HistoryController.makeCall);

//history of call for app
route.get(
  "/historyCall",
  checkAccessWithSecretKey(),
  HistoryController.historyApp
);

module.exports = route;
