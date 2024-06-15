const Gift = require("./gift.model");
const Category = require("../giftCategory/giftCategory.model");
const fs = require("fs");

//deleteFile
const { deleteFiles, deleteFile } = require("../../util/deleteFile");

//import model
const Setting = require("../setting/setting.model");

//Create Gift
exports.store = async (req, res) => {
  try {
    if (!req.body.coin || !req.files || !req.body.category) {
      if (req.files) {
        deleteFiles(req.files);
      }
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!" });
    }

    const category = await Category.findById(req.body.category);

    if (!category)
      return res
        .status(200)
        .json({ status: false, message: "Category does not Exist!" });

    const gift = req.files.map((gift) => ({
      image: gift.path,
      coin: req.body.coin,
      category: category._id,
      platFormType: req.body.platFormType,
      type: gift.mimetype === "image/gif" ? 1 : 0,
    }));

    const gifts = await Gift.insertMany(gift);

    let data = [];

    for (let i = 0; i < gifts.length; i++) {
      data.push(await Gift.findById(gifts[i]._id).populate("category", "name"));
    }

    return res.status(200).json({
      status: true,
      message: "Success!",
      gift: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//Get all gift for backend
exports.index = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $lookup: {
          from: "gifts",
          localField: "_id",
          foreignField: "category",
          as: "gift",
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
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//Get Category Wise Gift for app
exports.CategoryWiseGiftApp = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res
        .status(200)
        .json({ status: false, message: "Category Is Required!!" });
    }

    console.log(
      "🍔🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍔🍔🍔🍔🍔🍟🍟🍟🍟🍔req.query.categoryId🍔🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍔🍔🍔🍔🍔🍟🍟🍟🍟🍔",
      req.query.categoryId
    );

    // const setting = await Setting.findOne({});
    // const dataControl = setting.isData;

    const category = await Category.findOne({
      _id: req.query.categoryId,
      isActive: true,
    });

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: "Category Done Not Exist!" });
    }

    const gift = await Gift.aggregate([
      {
        $match: {
          category: { $eq: category._id },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    console.log(
      "🍔🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍔🍔🍔🍔🍔🍟🍟🍟🍟🍔gift🍔🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍕🍔🍔🍔🍔🍔🍟🍟🍟🍟🍔",
      gift
    );

    if (!gift) {
      return res
        .status(200)
        .json({ status: false, message: "No data found!!" });
    }

    return res.status(200).json({
      status: true,
      message: "Success!!",
      // gift: dataControl === true ? gift : [],
      gift,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//Get Category Wise Gift For Admin Penal
exports.CategoryWiseGift = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res
        .status(200)
        .json({ status: false, message: "Category Is Required" });
    }

    const category = await Category.findOne({
      _id: req.query.categoryId,
      isActive: true,
    });

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: "Category Done Not Exist!" });
    }

    const gift = await Gift.aggregate([
      {
        $match: {
          category: { $eq: category._id },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!gift) {
      return res
        .status(200)
        .json({ status: false, message: "Data Is Not Found" });
    }

    return res.status(200).json({
      status: true,
      message: "Success...!",
      categoryName: category.name,
      gift,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//Update Gift
exports.update = async (req, res) => {
  try {
    const gift = await Gift.findById(req.query.giftId);

    console.log("-------", gift);
    console.log("-------", req.query.giftId);
    console.log("-------", req.body);

    if (!gift) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Gift does not Exist!" });
    }

    if (req.file) {
      if (fs.existsSync(gift.image)) {
        fs.unlinkSync(gift.image);
      }
      console.log("image-----");
      gift.type = req.file.mimetype === "image/gif" ? 1 : 0;
      gift.image = req.file.path;
    }

    gift.coin = req.body.coin ? req.body.coin : gift.coin;
    gift.platFormType = req.body.platFormType
      ? req.body.platFormType
      : gift.platFormType;
    gift.category = req.body.category ? req.body.category : gift.category;

    await gift.save();

    // const data = await Gift.findById(gift._id).populate("category", "name");

    return res
      .status(200)
      .json({ status: true, message: "Update Success...!", gift: gift });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//delete gift
exports.destroy = async (req, res) => {
  try {
    const gift = await Gift.findById(req.query.giftId);

    if (!gift)
      return res
        .status(200)
        .json({ status: false, message: "Gift does not exist!!" });

    if (fs.existsSync(gift.image)) {
      fs.unlinkSync(gift.image);
    }

    await gift.deleteOne();

    return res
      .status(200)
      .json({ status: true, message: "data deleted successfully!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
