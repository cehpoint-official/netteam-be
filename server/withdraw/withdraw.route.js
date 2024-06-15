const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const WithdrawController = require("./withdraw.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//Create Banner Category [Backend]
route.post(
  "/",
  upload.single("image"),
  checkAccessWithSecretKey(),
  WithdrawController.store
);

route.post("/paytm", WithdrawController.paytm);

//Get Banner Category [Backend]
route.get("/", checkAccessWithSecretKey(), WithdrawController.index);

//Update Banner Category [Backend]
route.patch(
  "/",
  upload.single("image"),
  checkAccessWithSecretKey(),
  WithdrawController.update
);

//Get Banner Category [Backend]
route.delete("/", checkAccessWithSecretKey(), WithdrawController.delete);

module.exports = route;
