const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to parent category
    default: null,   // Null for top-level categories
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to subcategories
  }],

  image: {
    type: String, // URL or path to the image
    trim: true,
    default: ''
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});
const Category =  mongoose.model('Category', categorySchema);

module.exports = Category
