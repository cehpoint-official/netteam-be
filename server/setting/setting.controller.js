const Setting = require("./setting.model");

//create setting
exports.store = async (req, res) => {
  try {
    const setting = new Setting();

    await setting.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//create setting
exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update the setting data
exports.update = async (req, res) => {
  try {
    const setting = await Setting.findOne({});

    if (!setting)
      return res
        .status(200)
        .json({ status: false, message: "Setting data does not Exist!" });

    setting.coinPerDollar = req.body.coinPerDollar
      ? req.body.coinPerDollar
      : setting.coinPerDollar;

    setting.agoraKey = req.body.agoraKey ? req.body.agoraKey : setting.agoraKey;
    setting.agoraCertificate = req.body.agoraCertificate
      ? req.body.agoraCertificate
      : setting.agoraCertificate;

    setting.privacyPolicyLink = req.body.privacyPolicyLink
      ? req.body.privacyPolicyLink
      : setting.privacyPolicyLink;
    setting.privacyPolicyText = req.body.privacyPolicyText
      ? req.body.privacyPolicyText
      : setting.privacyPolicyText;
    setting.termAndCondition = req.body.termAndCondition
      ? req.body.termAndCondition
      : setting.termAndCondition;
    setting.googlePlayEmail = req.body.googlePlayEmail
      ? req.body.googlePlayEmail
      : setting.googlePlayEmail;
    setting.googlePlayKey = req.body.googlePlayKey
      ? req.body.googlePlayKey
      : setting.googlePlayKey;
    setting.stripePublishableKey = req.body.stripePublishableKey
      ? req.body.stripePublishableKey
      : setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey
      ? req.body.stripeSecretKey
      : setting.stripeSecretKey;
    setting.razorPayId = req.body.razorPayId
      ? req.body.razorPayId
      : setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey
      ? req.body.razorSecretKey
      : setting.razorSecretKey;
    setting.chargeForRandomCall = req.body.chargeForRandomCall
      ? req.body.chargeForRandomCall
      : setting.chargeForRandomCall;
    setting.coinCharge = req.body.coinCharge
      ? req.body.coinCharge
      : setting.coinCharge;
    setting.paymentGateway = req.body.paymentGateway
      ? req.body.paymentGateway
      : setting.paymentGateway;
    setting.chargeForPrivateCall = req.body.chargeForPrivateCall
      ? req.body.chargeForPrivateCall
      : setting.chargeForPrivateCall;
    setting.withdrawLimit = req.body.withdrawLimit
      ? req.body.withdrawLimit
      : setting.withdrawLimit;
    setting.link = req.body.link ? req.body.link : setting.link;

    setting.welcomeMessage = req.body.welcomeMessage
      ? req.body.welcomeMessage
      : setting.welcomeMessage;
    setting.redirectAppUrl = req.body.redirectAppUrl;
    setting.redirectMessage = req.body.redirectMessage;

    await setting.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    const setting = await Setting.findOne({});

    if (!setting)
      return res
        .status(200)
        .json({ status: false, message: "Setting data does not Exist!" });

    if (req.query.type === "googlePlay") {
      setting.googlePlaySwitch = !setting.googlePlaySwitch;
    } else if (req.query.type === "stripe") {
      setting.stripeSwitch = !setting.stripeSwitch;
    } else if (req.query.type === "data") {
      setting.isData = !setting.isData;
    } else if (req.query.type === "razorPay") {
      setting.razorPaySwitch = !setting.razorPaySwitch;
    } else if (req.query.type === "app") {
      setting.isAppActive = !setting.isAppActive;
    } else if (req.query.type === "fake") {
      setting.isFake = !setting.isFake;
    }

    await setting.save();

    return res.status(200).json({
      status: true,
      message: "Success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
