const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    notificationType: { type: Number, enum: [0, 1, 2, 3, 4, 5] }, // 0.admin 1.call 2.message 3.live 4.gift 5.rating
    message: String,
    type: { type: String, default: null }, // for host or user
    title: String,
    image: { type: String, default: null },
    date: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
