const express = require("express");
const router = express.Router();
const User = require("../model/userRouter.js");
const auth = require("../model/middleware/auth.js");

router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const user = await User.create(name, email, phone, password);
    console.log("Signup request body:", req.body);
    const token = user.getAuthToken();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    console.log(user);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    } else if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    } else if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

   
      const token = await user.getAuthToken();
      res.status(201).json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token: token,
      });
   
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }  else {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error" ,
      });
    }
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// logout all devices

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
