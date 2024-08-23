const express = require('express');
const router = express.Router();
const Item = require('../model/item');
const Category = require('../model/category');
const Auth = require("../model/middleware/auth");

// GET /items - List all items
router.get('/items', Auth, async (req, res) => {
  try {
    // Fetch all items with their associated category information
    const items = await Item.find().populate('category', 'name');
    res.status(200).json({
      success:true,
      message: 'Items retrieved successfully', items:{
      name: items.name,
      category:items.category,
      description:items.description,
      stock:items.stock,
      price:items.price,
      image:items.image,
      id: items.owner,
      image:items.image,
    } });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      success:false,
      message: error.message||'Server error while fetching items' });
  }
});

// POST /items - Create a new item
router.post('/createitems', async (req, res) => {
  const { name, price, description, categoryId, stock, image } = req.body;
  console.log(req.body)

  // Input validation
  if (!name || !price || !description || !categoryId || !stock || !image) {
    return res.status(400).json({
      success:false,
       message: 'All fields are required'
       });
  }

  try {
    // Verify that the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create and save the new item
    const item = new Item({ name, price, description, category: categoryId, stock, image });
    await item.save();

    res.status(201).json({ 
      success:true,
      message: 'Item created successfully', item:{
        name: item.name,
        category:item.category,
        description:item.description,
        stock:item.stock,
        price:item.price,
        image:item.image,
        id: item.owner,
        image:item.image,
      } 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

// PUT /items/:id - Update an item
router.put('/items/:id', Auth, async (req, res) => {
  const { name, price, description, categoryId, stock, image } = req.body;

  // Input validation
  if (!name || !price || !description || !categoryId || !stock || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Verify that the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success:false,
         message: 'Category not found' ,
        });
    }

    // Update the item with the given ID
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, price, description, category: categoryId, stock, image },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success:false,
         message: 'Item not found' 
        });
    }

    res.status(200).json({ message: 'Item updated successfully', item:{
      name: item.name,
      category:item.category,
      description:item.description,
      stock:item.stock,
      price:item.price,
      image:item.image,
      id: item.owner,
      image:item.image,
    } });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

// DELETE /items/:id - Delete an item
router.delete('/items/:id', Auth, async (req, res) => {
  try {
    // Find and delete the item with the given ID
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error while deleting item', error: error.message });
  }
});

module.exports = router;
