const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    agoraKey: { type: String, default: "b6fd6422e3df4d198e9eb0ea51d6d36b" },
    agoraCertificate: {
      type: String,
      default: "ff1a916057ac48e8a3ca631dd2ae47eb",
    },

    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    privacyPolicyText: { type: String, default: "PRIVACY POLICY TEXT" },
    termAndCondition: { type: String, default: "Term And Condition" },

    googlePlaySwitch: { type: Boolean, default: false },
    googlePlayEmail: { type: String, default: "GOOGLE PLAY EMAIL" },
    googlePlayKey: { type: String, default: "GOOGLE PLAY KEY" },

    stripeSwitch: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "STRIPE PUBLISHABLE KEY" },
    stripeSecretKey: { type: String, default: "STRIPE SECRET KEY" },

    razorPaySwitch: { type: Boolean, default: false },
    razorPayId: { type: String, default: "RAZOR PAY ID" },
    razorSecretKey: { type: String, default: "RAZOR SECRET KEY" },

    isAppActive: { type: Boolean, default: true },
    isFake: { type: Boolean, default: false },
    link: { type: String, default: "" },

    welcomeMessage: { type: String, default: "Welcome to NetTeam" }, // minimum diamond for withdraw [redeem]
    redirectAppUrl: { type: String, default: "Here Redirect App URL" },
    redirectMessage: { type: String, default: "Here Redirect Message" },

    chargeForRandomCall: { type: Number, default: 10 },
    chargeForPrivateCall: { type: Number, default: 30 },
    withdrawLimit: { type: Number, default: 0 },

    coinPerDollar: { type: Number, default: 50 },
    coinCharge: { type: Number, default: 0 },

    paymentGateway: { type: Array, default: [] },

    // isData: { type: Boolean, default: true },
    // location: { type: Array, default: [] },
    // numberOfFreeVideoCall: { type: Number, default: 5 },
    // minimumLiveTimeForHost: { type: Number, default: 0 },
    // durationOfFreeCall: { type: Number, default: 30 },
    // currency: { type: String, default: "$" },
    // chargeForMatchMale: { type: Number, default: 10 },
    // chargeForMatchFemale: { type: Number, default: 10 },
    // loginBonus: { type: Number, default: 30 },
    // maxLoginBonus: { type: Number, default: 30 },
    // minPrivateCallCharge: { type: Number, default: 30 },
    // referralBonus: { type: Number, default: 30 },
    // paymentGateway: { type: Array, default: [] },
    // hostSalary: { type: Number, default: 0 },
    // hostWithdrawalLimit: { type: Number, default: 0 },
    // webPaymentLink: { type: String, default: "WEB PAYMENT LINK" },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
