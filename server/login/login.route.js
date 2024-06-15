const express = require("express");
const route = express.Router();

const LoginController = require("./login.controller");

route.get("/login", LoginController.get);

module.exports = route;
