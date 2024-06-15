const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Hokoo User" },
    bio: { type: String, default: "Yes, This Is Hokoo User" },
    identity: String,
    uniqueID: { type: String, unique: true },
    fcm_token: String,
    email: { type: String, default: "Hokoo@gmail.com" },
    password: { type: String, default: null },
    token: { type: String, default: null },
    channel: { type: String, default: null },
    gender: { type: String, default: "Female" },
    dob: { type: String, default: "01-01-2000" },
    image: { type: String, default: null },
    country: { type: String, default: "" },
    loginType: { type: Number, enum: [0, 1, 2] }, //0.quick  1. google   2.userID
    lastLogin: String,
    platformType: { type: Number, enum: [0, 1], default: 0 }, //0.android  1.ios
    isOnline: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    isHost: { type: Boolean, default: false },
    isSignup: { type: Boolean, default: false },
    age: { type: Number, default: 0 },
    date: String,

    isCoinPlan: { type: Boolean, default: false }, // for coinPlan purchase
    plan: {
      planStartDate: { type: String, default: null }, // coinPlan start date
      coinPlanId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStreamingHistory",
      default: null,
    },
    agoraUid: { type: Number, default: 0 },

    coin: { type: Number, default: 800 },
    purchasedCoin: { type: Number, default: 0 },

    mobileNumber: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
