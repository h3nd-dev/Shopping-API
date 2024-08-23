const express = require("express");
const router = express.Router();
const Cart = require("../model/cartRouter");

// POST route to add an item to the cart
router.post("/cart", async (req, res) => {
  const { itemId, name, price, quantity } = req.body;

  if (!itemId || !name || !price || !quantity) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const newCartItem = new Cart({
      itemId,
      name,
      price,
      quantity,
    });

    await newCartItem.save();

    res.status(200).json({
      success: true,
      message: "Items added successfully",
      cart: {
        itemId: itemId,
        name: name,
        price: price,
        quantity: quantity,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error adding item to cart",
      error: err.message,
    });
  }
});

// GET route to fetch all items in the cart
router.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find(); // Fetch all items from the cart collection

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      cart: cartItems,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error fetching items in cart",
      error: err.message,
    });
  }
});

router.delete("/cart/:id", async (req, res) => {
  try {
    const cartItem = Cart.findByIdAndDelete(req.params.id);
    if (!cartItem) {
      return res.status(404).json({
        success: "false",
        message: "Item not found",
      });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error deleting items",
      error: err.message,
    });
  }
});

module.exports = router;
