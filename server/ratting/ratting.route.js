const express = require("express");
const router = express.Router();
const RattingController = require("./ratting.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

router.post(
  "/rattingByUserToHost",
  checkAccessWithSecretKey(),
  RattingController.rattingByUserToHost
);

module.exports = router;
