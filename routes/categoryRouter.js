const express = require("express");
const router = express.Router();
const Category = require("../model/category");

// Get all categories with their subcategories
router.get("/categories", async (req, res) => {
  try {
    // Use populate to fetch subcategories and their data
    const categories = await Category.find({ parent: null }).populate({
      path: "subcategories",
      populate: { path: "subcategories" }, // Deep populate for multiple levels
    });

    res.status(200).json({
      success: true,
      categories: categories.map((category) => ({
        name: category.name,
        description: category.description,
        image: category.image,
        parent: category.parent,
        subcategories: category.subcategories,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new category (can be a subcategory)
router.post("/create", async (req, res) => {
  const { name, parent, description, image } = req.body;

  try {
    // If a parent is specified, update the parent's subcategories array
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory)
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      const category = new Category({ name, parent, description, image });
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category: {
          name: category.name,
          description: category.description,
          image: category.image,
          parent: category.parent,
          subcategories: category.subcategories,
        },
      });
      await category.save();
    } else {
      // If no parent is specified, set the parent to null
      let parent = null;
      const category = new Category({ name, parent, description, image });
      await category.save();
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        category: {
          name: category.name,
          description: category.description,
          image: category.image,
          parent: category.parent,
          subcategories: category.subcategories,
        },
      });
    }
  } catch (err) {
    res.status(400).json({ message: "Validation failed", error: err.message });
  }
});

// Update an existing category
router.put("/categories/:id", async (req, res) => {
  const { name, parent,description,image } = req.body;

  try {
    // Find and update the category
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });

    // Update fields
  

      // Add to new parent subcategories
      if (parent) {
        const newParent = await Category.findById(parent);
        if (!newParent)
          return res
            .status(404)
            .json({
              success: false,
               message: "New parent category not found" 
              });

        newParent.parent = parent || newParent.parent;
        newParent.name = name || newParent.name;
        newParent.description = description || newParent.description;
        newParent.image = image || newParent.image;
        await newParent.save();
        res.status(200).json({
          success: true,
          message: "New parent category updated successfully",
          category: {
            name: newParent.name,
            description: newParent.description,
            image: newParent.image,
            parent: newParent.parent,
            subcategories: newParent.subcategories,
          },
        });
      } else {
        // Update fields
        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image || category.image;
        await category.save();
        res.status(200).json({
          success: true,
          message: "Category updated successfully",
          category: {
            name: category.name,
            description: category.description,
            image: category.image,
            parent: category.parent,
            subcategories: category.subcategories,
          },
        });
      }

      category.parent = parent || null;
    

    
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Validation failed", error: err.message });
  }
});

// Delete a category
router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });


    res
      .status(200)
      .json({ message: "Category deleted successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Fetch a specific category and its subcategories
router.get("/categories/:id", async (req, res) => {
  try { 
    
    const category = await Category.findById(req.params.id).populate({
      path: "subcategories",
      populate: { path: "subcategories" },
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category: {
        name: category.name,
        description: category.description,
        image: category.image,
        parent: category.parent,
        subcategories: category.subcategories,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
