const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const User = require("../model/userRouter");
const Item = require("./item");

const cartSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectID,
      require: true,
      ref: "User",
    },
    items: [
      {
        itemId: {
          type: ObjectID,
          ref: "Item",
          require: true,
        },
        name: String,
        quantity: {
          type: Number,
          require: true,
          min: 1,
          default: 1,
        },
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
