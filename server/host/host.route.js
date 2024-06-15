const express = require("express");
const router = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const checkAccessWithSecretKey = require("../../checkAccess");

const hostFile = require("./host.controller");

//All Host Get API [Backend]
router.get("/", checkAccessWithSecretKey(), hostFile.hostGet);

//Login Host
router.post("/login", checkAccessWithSecretKey(), hostFile.login);

//create album
router.post(
  "/addAlbum",
  upload.single("album"),
  //upload.fields([{ name: "album" }]),
  checkAccessWithSecretKey(),
  hostFile.addAlbum
);

//delete album
router.delete("/deleteAlbum", checkAccessWithSecretKey(), hostFile.deleteAlbum);

//get host profile who login [App,Backend]
router.get("/hostProfile", checkAccessWithSecretKey(), hostFile.getProfile);

//Update host In admin
router.patch(
  "/updateHost",
  upload.fields([{ name: "album" }, { name: "image", maxCount: 1 }]),
  checkAccessWithSecretKey(),
  hostFile.updateHostProfile
);

//Update host In App
router.patch(
  "/updateProfile",
  upload.fields([{ name: "album" }, { name: "image", maxCount: 1 }]),
  checkAccessWithSecretKey(),
  hostFile.updateProfile
);

//Update Host Image, CoverImage and Album [App]
router.patch(
  "/updateImage",
  upload.fields([{ name: "album" }, { name: "image", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  checkAccessWithSecretKey(),
  hostFile.updateHostImage
);

//delete Host Album
router.delete("/deleteImage", checkAccessWithSecretKey(), hostFile.deleteHostAlbum);

//Get countryWise Host Thumb List [App]
router.get("/hostThumbList", checkAccessWithSecretKey(), hostFile.getHostThumbList);

//isOnline
router.patch("/isOnline", checkAccessWithSecretKey(), hostFile.isOnline);

//block or unblock the host(disable the host)
router.patch("/isBlock", checkAccessWithSecretKey(), hostFile.blockHost);

//add fake host by admin
router.post(
  "/AddFakehost",
  checkAccessWithSecretKey(),
  upload.fields([{ name: "image" }, { name: "video" }, { name: "album" }]),
  hostFile.AddFakeHost
);

//update Fake host by admin
router.patch(
  "/updateFakeHost",
  checkAccessWithSecretKey(),
  upload.fields([{ name: "image" }, { name: "video" }, { name: "album" }]),
  hostFile.updateFakeHost
);

//delete fake host
router.delete("/deleteFakeHost", checkAccessWithSecretKey(), hostFile.deleteFakeHost);

//isLive handle for fake host
router.patch("/isLive", checkAccessWithSecretKey(), hostFile.isLive);

module.exports = router;
