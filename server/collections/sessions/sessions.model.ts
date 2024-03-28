import mongoose from "mongoose";

const session = new mongoose.Schema(
  {
    cookie: {
      type: String,
      required: [true, "Please add a cookie"],
    },
    userId: {
      type: String,
      required: [true, "Please add a UserId"],
    },
    expires: {
      type: Date,
      required: [true, "Please add a value"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", session);
