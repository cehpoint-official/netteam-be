const Category = require("./giftCategory.model");
const Gift = require("../gift/gift.model");
const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");

//Create Gift Category
exports.store = async (req, res) => {
  try {
    if (!req.file || !req.body.name) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }

    const category = new Category();

    category.name = req.body.name;
    category.image = req.file.path;

    await category.save();

    return res.status(200).json({
      status: true,
      message: "Success!",
      category,
    });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Get Gift Category For Admin
exports.index = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $lookup: {
          from: "gifts",
          localField: "_id",
          foreignField: "category",
          as: "gift",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          image: 1,
          createdAt: 1,
          isActive: 1,
          giftCount: { $size: "$gift" },
        },
      },
    ]);

    // console.log("gift----", category);

    if (!category)
      return res.status(200).json({ status: false, message: "No data found!" });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      category,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Get Gift Category For App
exports.indexApp = async (req, res) => {
  try {
    // console.log("----matchQuery", matchQuery);

    const category = await Category.aggregate([
      // { $match: matchQuery },
      {
        $match: {
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "gifts",
          localField: "_id",
          foreignField: "category",
          as: "gift",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          name: 1,
          image: 1,
          createdAt: 1,
          isActive: 1,
          giftCount: { $size: "$gift" },
        },
      },
    ]);

    if (!category)
      return res.status(200).json({ status: false, message: "No data found!" });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      gift: category,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Update Gift Category
exports.update = async (req, res) => {
  try {
    const category = await Category.findById(req.query.categoryId);

    if (!category) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Category Done Not Exist..!" });
    }

    if (req.file) {
      if (fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }
      category.image = req.file.path;
    }
    category.name = req.body.name;
    await category.save();

    return res
      .status(200)
      .json({ status: true, message: "Success...!", category });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Delete Gift Category
exports.destroy = async (req, res) => {
  try {
    const category = await Category.findById(req.query.categoryId);

    if (!category)
      return res
        .status(200)
        .json({ status: false, message: "Category does not Exist!" });

    if (fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }

    const gift = await Gift.find({ category: category._id });

    await gift.map(async (data) => {
      if (fs.existsSync(data.image)) {
        fs.unlinkSync(data.image);
      }
      await data.deleteOne();
    });

    await category.deleteOne();

    return res.status(200).json({ status: true, message: "Success!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
