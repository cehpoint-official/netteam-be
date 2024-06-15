const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
  type: String,
});

module.exports = mongoose.model("Block", blockSchema);
