const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;
const User = require("./userRouter");
const Category = require("./category");

const itemSchema = mongoose.Schema(
  {
    owner: {
      type: ObjectID,
      require: true,
      ref: "User",
    },
    name: {
      type: String,
      require: true,
      trim: true,
    },
    category: {
      type: ObjectID,
      ref: "Category",
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image: {
      type: String, // URL or path to the image
      validate: {
        validator: function (value) {
          return /^(ftp|http|https):\/\/[^ "]+$/.test(value) || value === "";
        },
        message: "Image must be a valid URL",
      },
      default: "",
    },
    price: {
      type: Number,
      require: true,
      min: 0,
    },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
