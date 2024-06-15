const mongoose = require("mongoose");

const giftCategorySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("GiftCategory", giftCategorySchema);
