const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    url: String,
    image: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
