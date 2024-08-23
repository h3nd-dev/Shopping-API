// Imports
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const userRouter = require("./routes/route"); // Typically routes should be in a routes folder
const itemRouter = require("./routes/itemRouter");
// const cartRouter = require("./routes/cartRouter");
const categoryRouter = require("./routes/categoryRouter.js");
const payment = require("./model/payment.js");
const paymentRouter = require("./routes/paymentRouter.js");

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret", // Store your session secret in .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Database Connection
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on("error", (error) => console.error("Database connection error:", error));
db.once("open", () => console.log("Connected to database"));
// Use CORS middleware
app.use(
  cors({
    origin: "*", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
    credentials: true, // Allow credentials like cookies
  })
);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "ejs");

// Routes
app.use("/users", userRouter); // Mounting user-related routes
app.use("/items", itemRouter); // Mounting item-related routes
// app.use("/cart", cartRouter);  // Mounting cart-related routes

app.use("/categories", categoryRouter); // Mounting category-related routes
app.use("/payments", paymentRouter); // Mounting payment-related routes

// Starting the Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
