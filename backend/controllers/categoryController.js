import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * Category Controller
 * Handles CRUD operations for categories
 */

/**
 * Get all categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const categories = await Category.find(query)
      .populate("createdBy", "name email")
      .sort({ name: 1 });

    res.json({ categories, count: categories.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single category
 */
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id).populate("createdBy", "name email");
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category });
  } catch (err) {
    next(err);
  }
};

/**
 * Create category
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, status } = req.body;
    const createdBy = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category with same name exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      image: image || "",
      status: status || "active",
      createdBy,
    });

    await category.populate("createdBy", "name email");

    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }
    next(err);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const { name, description, image, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ message: "Category with this name already exists" });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = status;

    await category.save();
    await category.populate("createdBy", "name email");

    res.json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }
    next(err);
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category is being used by any courses
    const Course = (await import("../models/courseModel.js")).default;
    const coursesUsingCategory = await Course.countDocuments({ category: category.name });
    
    if (coursesUsingCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${coursesUsingCategory} course(s).` 
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};

