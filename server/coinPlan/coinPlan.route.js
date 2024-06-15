const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const CoinPlanController = require("./coinPlan.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//create coin plan [Backend]
route.post("/", checkAccessWithSecretKey(), CoinPlanController.store);

//get coin plan [Backend]
route.get("/", checkAccessWithSecretKey(), CoinPlanController.index);

//get coin plan [APP]
route.get("/appPlan", checkAccessWithSecretKey(), CoinPlanController.appPlan);

//update coin plan [Backend]
route.patch("/", checkAccessWithSecretKey(), CoinPlanController.update);

//delete coin plan [Backend]
route.delete("/", checkAccessWithSecretKey(), CoinPlanController.destroy);

//active deactivate coin plan [Backend]
route.put("/", checkAccessWithSecretKey(), CoinPlanController.activeInactive);

//create coinHistory for android
route.post(
  "/createHistory",
  checkAccessWithSecretKey(),
  CoinPlanController.createHistory
);

module.exports = route;
