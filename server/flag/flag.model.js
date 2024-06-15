const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
  {
    name: String,
    flag: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Flag", flagSchema);
