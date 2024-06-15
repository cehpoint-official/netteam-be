const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const BannerController = require("./banner.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//Create Banner Category [Backend]
route.post(
  "/",
  upload.single("image"),
  checkAccessWithSecretKey(),
  BannerController.store
);

//Get Banner Category [Backend]
route.get("/", checkAccessWithSecretKey(), BannerController.index);

//Update Banner Category [Backend]
route.patch(
  "/",
  upload.single("image"),
  checkAccessWithSecretKey(),
  BannerController.update
);

//Get Banner Category [Backend]
route.delete("/", checkAccessWithSecretKey(), BannerController.delete);

module.exports = route;
