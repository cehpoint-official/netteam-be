//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../checkAccess");

//Controller
const ChatController = require("./chat.controller");

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

//get old chat
route.get("/getOldChat", checkAccessWithSecretKey(), ChatController.getOldChat);

//create chat [with image,video,audio]
route.post(
  "/createChat",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  ChatController.store
);

//delete Chat
route.delete(
  "/deleteChat",
  checkAccessWithSecretKey(),
  ChatController.deleteChat
);

//delete All Chat
// route.delete(
//   "/deleteAllChat",
//   checkAccessWithSecretKey(),
//   ChatController.destroyAllChat
// );

module.exports = route;
