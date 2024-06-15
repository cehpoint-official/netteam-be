const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Hokoo Host" },
    bio: { type: String, default: "I am Hokoo Host 🤩🤩" },
    gender: String,
    identity: String,
    age: { type: Number, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uniqueID: String,
    image: { type: String, default: null },
    video: { type: String, default: null },
    isAccepted: { type: Boolean, default: false },
    date: String,
    email: String,
    country: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Request", requestSchema);
