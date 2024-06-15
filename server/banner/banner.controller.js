const Banner = require("./banner.model");

const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");

//Create Banner
exports.store = async (req, res) => {
  try {
    if (!req.file || !req.body.url) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }

    const banner = new Banner();

    banner.url = req.body.url;
    banner.image = req.file.path;

    await banner.save();

    return res
      .status(200)
      .json({ status: true, message: "Banner Create Successfully..!", banner });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Update Banner
exports.update = async (req, res) => {
  try {
    if (!req.query.bannerId) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }

    const banner = await Banner.findById(req.query.bannerId);

    if (!banner) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "banner does not exist!!" });
    }

    if (req.file) {
      if (fs.existsSync(banner.image)) {
        fs.unlinkSync(banner.image);
      }
      banner.image = req.file.path;
    }
    banner.url = req.body.url;

    await banner.save();

    return res
      .status(200)
      .json({ status: true, message: "Banner Create Successfully..!", banner });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Delete Banner
exports.delete = async (req, res) => {
  if (!req.query.bannerId) {
    return res
      .status(200)
      .json({ status: false, message: "Oops ! Invalid Details!!" });
  }

  const banner = await Banner.findById(req.query.bannerId);

  if (!banner) {
    return res
      .status(200)
      .json({ status: false, message: "banner does not exist!!" });
  }

  if (fs.existsSync(banner.image)) {
    fs.unlinkSync(banner.image);
  }

  await banner.deleteOne();

  return res.status(200).json({ status: true, message: "Success!!" });
};

//Get Banner
exports.index = async (req, res) => {
  try {
    const banner = await Banner.find();

    return res.status(200).json({ status: true, message: "Success!!", banner });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error!!" });
  }
};
