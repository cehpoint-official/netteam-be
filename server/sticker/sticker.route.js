const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../../util/multer");

const StickerController = require("./sticker.controller");
const upload = multer({
  storage,
});

const checkAccessWithKey = require("../../checkAccess");

// get all sticker
router.get("/", checkAccessWithKey(), StickerController.index);

//create sticker
router.post("/", checkAccessWithKey(), upload.any(), StickerController.store);

// update sticker
router.patch("/:stickerId", checkAccessWithKey(), upload.single("sticker"), StickerController.update);

// delete sticker
router.delete("/:stickerId", checkAccessWithKey(), StickerController.destroy)

module.exports = router;
