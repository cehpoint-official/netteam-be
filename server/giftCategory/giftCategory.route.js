const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const CategoryController = require("./giftCategory.controller");

const checkAccessWithSecretKey = require("../../checkAccess");

//Create Gift Category [Backend]
route.post(
  "/",
  upload.single("image"),
  checkAccessWithSecretKey(),
  CategoryController.store
);

//Get All Gift Category [Backend]
route.get("/", checkAccessWithSecretKey(), CategoryController.index);

//Get All Gift Category [App]
route.get("/app", checkAccessWithSecretKey(), CategoryController.indexApp);

//Update Gift Category [Backend]
route.patch(
  "/",
  checkAccessWithSecretKey(),
  upload.single("image"),
  CategoryController.update
);

//Update Gift Category [Backend]
route.delete("/", checkAccessWithSecretKey(), CategoryController.destroy);

module.exports = route;
