import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue } from "../utils/languageHelper.js";

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
      .sort({ createdAt: -1 });

    const categoriesData = categories.map(category => {
      const categoryObj = category.toObject();
      categoryObj.name = getLanguageValue(categoryObj.name);
      categoryObj.description = getLanguageValue(categoryObj.description);
      return categoryObj;
    });

    res.json({ categories: categoriesData, count: categoriesData.length });
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

    const categoryObj = category.toObject();
    categoryObj.name = getLanguageValue(categoryObj.name);
    categoryObj.description = getLanguageValue(categoryObj.description);
    res.json({ category: categoryObj });
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

    const normalizedName = normalizeLanguageValue(name);
    const nameValue = getLanguageValue(normalizedName);

    if (!nameValue || !nameValue.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${nameValue.trim()}$`, "i") } },
        { name: { $regex: new RegExp(`^${nameValue.trim()}$`, "i") } }
      ]
    });
    if (existing) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }

    const category = await Category.create({
      name: normalizedName,
      description: normalizeLanguageValue(description),
      image: image || "",
      status: status || "active",
      createdBy,
    });

    await category.populate("createdBy", "name email");
    const categoryObj = category.toObject();
    categoryObj.name = getLanguageValue(categoryObj.name);
    categoryObj.description = getLanguageValue(categoryObj.description);
    res.status(201).json({ category: categoryObj });
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

    if (name !== undefined) {
      const normalizedName = normalizeLanguageValue(name);
      const nameValue = getLanguageValue(normalizedName);
      const currentNameValue = getLanguageValue(category.name);

      if (nameValue.trim() !== currentNameValue) {
        const existing = await Category.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${nameValue.trim()}$`, "i") } },
            { name: { $regex: new RegExp(`^${nameValue.trim()}$`, "i") } }
          ],
          _id: { $ne: id }
        });
        if (existing) {
          return res.status(409).json({ message: "Category with this name already exists" });
        }
      }
      category.name = normalizedName;
    }

    if (description !== undefined) category.description = normalizeLanguageValue(description);
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = status;

    await category.save();
    await category.populate("createdBy", "name email");
    const categoryObj = category.toObject();
    categoryObj.name = getLanguageValue(categoryObj.name);
    categoryObj.description = getLanguageValue(categoryObj.description);
    res.json({ category: categoryObj });
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

    const Course = (await import("../models/courseModel.js")).default;
    const categoryNameValue = getLanguageValue(category.name);
    const coursesUsingCategory = await Course.countDocuments({
      $or: [
        { category: categoryNameValue },
        { "category.en": categoryNameValue }
      ]
    });
    
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

