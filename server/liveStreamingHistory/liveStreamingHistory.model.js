const mongoose = require("mongoose");

const liveStreamingHistorySchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
    duration: { type: Number, default: 0 },
    user: { type: Number, default: 0 }, // how many user joined the live streaming [user count]
    gift: { type: Number, default: 0 }, // how many gifts host received
    comment: { type: Number, default: 0 },
    coin: { type: Number, default: 0 }, // how many Coin live host earned
    startTime: String,
    endTime: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "LiveStreamingHistory",
  liveStreamingHistorySchema
);
