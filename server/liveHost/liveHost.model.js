const mongoose = require("mongoose");

const liveHostSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    image: String,
    profileImage: String,
    dob: String,
    token: String,
    channel: String,
    coin: Number,

    agoraUID: { type: Number, default: 0 },
    view: { type: Number, default: 0 },
    isInCall: { type: Boolean, default: false },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
    },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStreamingHistory",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("LiveHost", liveHostSchema);
