const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    message: { type: String },
    contact: { type: String },
    image: { type: String, default: "null" },
    date: String,
    isSolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("complaint", complaintSchema);
