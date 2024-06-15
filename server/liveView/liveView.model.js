const mongoose = require("mongoose");

const LiveViewSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    agoraId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveStreamingHistory",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LiveView", LiveViewSchema);
