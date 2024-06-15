const CoinPlan = require("./coinPlan.model");

// import model
const User = require("../user/model");
const History = require("../history/history.model");
const Setting = require("../setting/setting.model");

//import config
const config = require("../../config");

//create Coin Plan
exports.store = async (req, res) => {
  try {
    if (
      !req.body.dollar ||
      !req.body.productKey ||
      req.body.platFormType < 0 ||
      !req.body.coin
    ) {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!!" });
    }

    const coinPlan = new CoinPlan();

    coinPlan.coin = req.body.coin;
    coinPlan.extraCoin = req.body.extraCoin;
    coinPlan.dollar = req.body.dollar;
    coinPlan.productKey = req.body.productKey;
    coinPlan.tag = req.body.tag;
    coinPlan.platFormType = parseInt(req.body.platFormType);

    await coinPlan.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get active Coin Plan
exports.appPlan = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find({ isActive: true });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all Coin Plan
exports.index = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find().sort({ coin: 1 });

    return res.status(200).json({
      status: true,
      message: "Success!!!",
      coinPlan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//update Coin Plan
exports.update = async (req, res) => {
  try {
    if (!req.query.planId) {
      return res
        .status(200)
        .json({ status: false, message: "coin planId is required!!" });
    }

    const coinPlan = await CoinPlan.findById(req.query.planId);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: "plan does not exist!!" });
    }

    coinPlan.coin = req.body.coin ? req.body.coin : coinPlan.coin;
    coinPlan.extraCoin = req.body.extraCoin
      ? req.body.extraCoin
      : coinPlan.extraCoin;
    coinPlan.dollar = req.body.dollar ? req.body.dollar : coinPlan.dollar;
    coinPlan.tag = req.body.tag ? req.body.tag : coinPlan.tag;
    coinPlan.productKey = req.body.productKey
      ? req.body.productKey
      : coinPlan.productKey;

    coinPlan.platFormType = req.body.platFormType
      ? parseInt(req.body.platFormType)
      : parseInt(coinPlan.platFormType);

    await coinPlan.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//delete Coin Plan
exports.destroy = async (req, res) => {
  try {
    if (!req.query.planId) {
      return res
        .status(200)
        .json({ status: false, message: "coin planId is required!!" });
    }

    const coinPlan = await CoinPlan.findById(req.query.planId);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: "Plan does not exists!!" });
    }

    await coinPlan.deleteOne();

    return res
      .status(200)
      .json({ status: true, message: "data deleted successfully!!" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//activate Inactivate Switch
exports.activeInactive = async (req, res) => {
  try {
    if (!req.query.planId) {
      return res
        .status(200)
        .json({ status: false, message: "coin planId is required!!" });
    }

    const coinPlan = await CoinPlan.findById(req.query.planId);

    if (!coinPlan) {
      return res
        .status(200)
        .json({ status: false, message: "Plan does not exists!!" });
    }

    coinPlan.isActive = !coinPlan.isActive;

    await coinPlan.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      coinPlan,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//create coinHistory for android
exports.createHistory = async (req, res) => {
  console.log("-----");
  try {
    if (req.body.userId && req.body.coinPlanId && req.body.paymentGateway) {
      const user = await User.findById(req.body.userId);

      if (!user) {
        return res.json({
          status: false,
          message: "User does not exist!!",
        });
      }

      const coinPlan = await CoinPlan.findById(req.body.coinPlanId);

      if (!coinPlan) {
        return res.json({
          status: false,
          message: "coinPlanId does not exist!!",
        });
      }

      user.coin += coinPlan.coin + coinPlan.extraCoin;
      user.purchasedCoin += coinPlan.coin + coinPlan.extraCoin;
      user.isCoinPlan = true;
      user.plan.planStartDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      user.plan.coinPlanId = coinPlan._id;

      await user.save();

      const history = new History();

      history.userId = user._id;
      history.coinPlanId = coinPlan._id;
      history.coin = coinPlan.coin + coinPlan.extraCoin;
      history.type = 2;
      history.paymentGateway = req.body.paymentGateway; // 1.GooglePlay 2.RazorPay 3.Stripe
      history.date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      await history.save();

      return res.json({
        status: true,
        message: "Success!!",
        history,
      });
    } else {
      return res.json({
        status: false,
        message: "Oops!! Invalid details!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
