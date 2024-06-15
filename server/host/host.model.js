const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Hookzy Host" },
    bio: { type: String, default: "I am Hookzy Host ☺" },
    identity: String,
    fcm_token: String,
    email: { type: String, default: null },
    mobileNumber: { type: String, default: null },
    uniqueID: { type: String, default: null },
    password: { type: String, default: null },
    token: { type: String, default: null },
    channel: { type: String, default: null },
    gender: { type: String, default: "Female" },
    country: { type: String, default: "" },
    loginType: { type: Number, enum: [0, 1, 2] }, //0.quick  1.google 2.id-pass
    lastLogin: String,
    platformType: { type: Number, enum: [0, 1], default: 0 }, //0.android  1.ios
    coin: { type: Number, default: 0 },
    dob: { type: String, default: "01-01-2000" },
    image: { type: String, default: null },
    album: { type: Array, default: [] },
    coverImage: {
      type: String,
      default: "https://work10.digicean.com/storage/defaultCoverImage.jpeg",
    },
    isOnline: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    isHost: { type: Boolean, default: true },
    isAccept: { type: Boolean },
    isConnect: { type: Boolean, default: false },
    age: Number,
    date: String,

    withdrawalCoin: { type: Number, default: 0 },
    receiveCoin: { type: Number, default: 0 },
    receiveGift: { type: Number, default: 0 },
    callCharge: { type: Number, default: 0 },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStreamingHistory",
      default: null,
    },
    agoraUid: { type: Number, default: 0 },

    isFake: { type: Boolean, default: false },
    video: { type: String, default: null },
    videoType: { type: Number, enum: [0, 1], default: null },
    imageType: { type: Number, enum: [0, 1], default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Host", hostSchema);
