const mongoose = require("mongoose");

const coinPlanSchema = new mongoose.Schema(
  {
    coin: Number,
    dollar: Number,
    tag: String,
    extraCoin: { type: Number, default: 0 },
    productKey: String,
    platFormType: { type: Number, enum: [0, 1], default: 0 }, //0.android  1.ios
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("CoinPlan", coinPlanSchema);
