//Express
const express = require("express");

const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

const SettingController = require("./setting.controller");

//store setting
route.post("/", checkAccessWithSecretKey(), SettingController.store);

//update setting
route.patch("/", checkAccessWithSecretKey(), SettingController.update);

route.get("/", SettingController.getSetting);

//handle setting switch
route.put("/", checkAccessWithSecretKey(), SettingController.handleSwitch);

module.exports = route;
