const mongoose = require("mongoose");

const chatTopicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
chatTopicSchema.index({ userId: 1 });
chatTopicSchema.index({ hostId: 1 });
chatTopicSchema.index({ chat: 1 });
module.exports = mongoose.model("ChatTopic", chatTopicSchema);
