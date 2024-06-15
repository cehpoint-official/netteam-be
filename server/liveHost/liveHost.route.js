const express = require("express");
const router = express.Router();

const LiveHostController = require("./liveHost.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//live the host
router.post("/", checkAccessWithSecretKey(), LiveHostController.hostIsLive);

//get live host list
router.get(
  "/liveHostList",
  checkAccessWithSecretKey(),
  LiveHostController.getLiveHostList
);

module.exports = router;
