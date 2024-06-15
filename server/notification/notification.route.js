//Express
const express = require("express");
const route = express.Router();

//Security Key
const checkAccessWithSecretKey = require("../../checkAccess");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const NotificationController = require("./notification.controller");

//Get User Notification List
route.get(
  "/userList",
  checkAccessWithSecretKey(),
  NotificationController.getUserNotificationList
);

//Get Host Notification List
route.get(
  "/hostList",
  checkAccessWithSecretKey(),
  NotificationController.getHostNotificationList
);

//send notification by admin penal
route.post(
  "/sendNotification",
  checkAccessWithSecretKey(),
  upload.single("image"),
  NotificationController.sendNotification
);

//send notification by admin penal
route.post(
  "/updateFCM",
  checkAccessWithSecretKey(),
  NotificationController.updateFCM
);

module.exports = route;
