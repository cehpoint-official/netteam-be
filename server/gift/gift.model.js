const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
  {
    image: String,
    coin: Number,
    type: { type: Number, enum: [0, 1], default: 0 }, //0 : image , 1 : gif
    category: { type: mongoose.Schema.Types.ObjectId, ref: "GiftCategory" },
    platFormType: { type: Number, enum: [0, 1], default: 0 }, //0 : android , 1 : IOS
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
giftSchema.index({ category: 1 });

module.exports = mongoose.model("Gift", giftSchema);
