const mongoose = require("mongoose");

const hostStorySchema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    video: { type: String, default: null },
    startDate: String,
    endDate: String,
    view: { type: Number, default: 0 },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
    expiration_date: { type: Date, required: true, expires: 0 }, //for story deleted after 24 hours
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("HostStory", hostStorySchema);
