const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      default: null,
    },
    coinPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoinPlan",
    },

    paymentGateway: String,
    date: String,

    isIncome: { type: Boolean, default: true },
    coin: { type: Number, default: 0 },
    type: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    //0:gift, 1:message , 2:purchase [coin purchase], 3:call, 4:ad[from watching ad], 5:login bonus, 6:referral bonus, 7: cashOut,
    //8:admin [admin add or less the coin or diamond through admin panel], 9:random-match

    //this fields for videoCall
    callUniqueId: { type: String, default: null }, //callRoomId
    callConnect: { type: Boolean, default: false },
    callStartTime: { type: String, default: null },
    callEndTime: { type: String, default: null },
    duration: { type: Number, default: 0 },
    videoCallType: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("History", historySchema);
