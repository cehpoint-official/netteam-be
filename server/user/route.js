const express = require("express");
const router = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const checkAccessWithSecretKey = require("../../checkAccess");

const userController = require("./controller");

router.get("/userGet", checkAccessWithSecretKey(), userController.userGet);

router.get("/userProfile", checkAccessWithSecretKey(), userController.userProfile);

router.post("/userProfile", checkAccessWithSecretKey(), upload.single("image"), userController.loginUser);

router.patch("/userProfile", checkAccessWithSecretKey(), upload.single("image"), userController.updateUser);

router.patch("/isBlock", checkAccessWithSecretKey(), userController.isBlock);

router.post("/addLessCoin", checkAccessWithSecretKey(), userController.addOrLessCoin);

router.post("/addCoinByAdmin", checkAccessWithSecretKey(), userController.addCoinByAdmin);

router.get("/adminAddCoinHistory", checkAccessWithSecretKey(), userController.adminAddCoinHistory);

module.exports = router;
