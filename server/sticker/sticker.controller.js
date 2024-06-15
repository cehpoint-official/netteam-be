const Sticker = require("./sticker.model");
const fs = require("fs");
const { deleteFiles, deleteFile } = require("../../util/deleteFile");

//get sticker list
exports.index = async (req, res) => {
  try {
    var sticker;
    if (req.query.type == "love") {
      sticker = await Sticker.find({ type: "love" }).sort({ createdAt: -1 });
    } else if (req.query.type == "emoji") {
      sticker = await Sticker.find({ type: "emoji" }).sort({ createdAt: -1 });
    } else {
      sticker = await Sticker.find().sort({ createdAt: -1 });
    }

    if (!sticker)
      return res.status(200).json({ status: false, message: "No data found!" });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", sticker });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//store multiple sticker
exports.store = async (req, res) => {
  try {
    if (!req.files)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!" });

    const sticker = req.files.map((sticker) => ({
      sticker: sticker.path,
      type: req.body.type,
    }));

    const stickers = await Sticker.insertMany(sticker);

    return res
      .status(200)
      .json({ status: true, message: "Success!", sticker: stickers });
  } catch (error) {
    console.log(error);
    deleteFiles(req.files);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update sticker
exports.update = async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.stickerId);

    if (!sticker) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Sticker does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(sticker.sticker)) {
        fs.unlinkSync(sticker.sticker);
      }
      sticker.sticker = req.file.path;
    }
    sticker.type = req.body.type ? req.body.type : sticker.type;
    await sticker.save();

    return res.status(200).json({ status: true, message: "Success!", sticker });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//delete sticker
exports.destroy = async (req, res) => {
  try {
    const sticker = await Sticker.findById(req.params.stickerId);

    if (!sticker)
      return res
        .status(200)
        .json({ status: false, message: "Sticker does not Exist!" });

    if (fs.existsSync(sticker.sticker)) {
      fs.unlinkSync(sticker.sticker);
    }

    await sticker.deleteOne();

    return res.status(200).json({ status: true, message: "Success!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
