const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Email is invalid",
      },
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value); // Customize regex as needed
        },
        message: "Phone number is invalid. It must be exactly 10 digits.",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate: {
        validator: function (value) {
          return !value.toLowerCase().includes("password");
        },
        message: "Password must not contain the word 'password'",
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// generate auth token

userSchema.methods.getAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save;
  return token;
};

// create user

userSchema.statics.create = async function (name, email, phone, password) {

  console.log(password)
  // Basic type checking
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof phone !== "string"
  ) {
    throw new Error("Invalid data types for user creation");
  }

  if (!email || !password || !name || !phone) {
    throw new Error("Missing required fields: email, password, name, phone");
  }
  try {
    const user = new this({ email, password, name, phone });
    await user.save();
    return user;
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => {
        return {
          field: error.path,
          message: error.message,
        };
      });
      throw new ValidationError(errors);
    }
    throw err;
  }
  console.log(err);
};

// Custom Error Class for Validation Errors
class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

// login user
userSchema.statics.findByCredentials = async function (email, password) {
  try {
    const user = await User.findOne({ email });
    console.log(user)

    if (!user) {
      throw new Error("User not found");
    }
    console.log( user.password)
    console.log( password)
    const isMatch = await bcrypt.compare(password, `${user.password}`);
    console.log(isMatch)

    if (!isMatch) {
      throw new Error("Password does not match");
    }

    return user;
  } catch (err) {
    throw new Error(err.message)
  }
};

//Hash plain password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
