import Language from "../models/languageModel.js";
import mongoose from "mongoose";

/**
 * Language Controller
 * Admin-only operations for managing languages
 */

/**
 * Create a new language (Admin only)
 */
export const createLanguage = async (req, res, next) => {
  try {
    const { name, code, nativeName, flag, status } = req.body;

    // Check if language with same name or code already exists
    const existing = await Language.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { code: code.toUpperCase() },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: "Language with this name or code already exists" });
    }

    const language = await Language.create({
      name,
      code: code.toUpperCase(),
      nativeName,
      flag,
      status: status || "active",
    });

    res.status(201).json({ language });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Language with this name or code already exists" });
    }
    next(err);
  }
};

/**
 * Get all languages (Admin)
 */
export const getLanguages = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { nativeName: { $regex: search, $options: "i" } },
      ];
    }

    const languages = await Language.find(query).sort({ name: 1 });
    res.json({ languages, count: languages.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single language by ID
 */
export const getLanguageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid language ID" });
    }

    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }

    res.json({ language });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a language (Admin only)
 */
export const updateLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid language ID" });
    }

    const { name, code, nativeName, flag, status } = req.body;
    const language = await Language.findById(id);

    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }

    // Check for duplicates if name or code is being updated
    if (name || code) {
      const updateQuery = { _id: { $ne: id } };
      const orConditions = [];
      if (name) {
        orConditions.push({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      }
      if (code) {
        orConditions.push({ code: code.toUpperCase() });
      }
      if (orConditions.length > 0) {
        updateQuery.$or = orConditions;
        const existing = await Language.findOne(updateQuery);
        if (existing) {
          return res.status(409).json({ message: "Language with this name or code already exists" });
        }
      }
    }

    if (name !== undefined) language.name = name;
    if (code !== undefined) language.code = code.toUpperCase();
    if (nativeName !== undefined) language.nativeName = nativeName;
    if (flag !== undefined) language.flag = flag;
    if (status !== undefined) language.status = status;

    await language.save();
    res.json({ language });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Language with this name or code already exists" });
    }
    next(err);
  }
};

/**
 * Delete a language (Admin only)
 */
export const deleteLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid language ID" });
    }

    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }

    // Check if language has any teacher-course mappings
    const TeacherCourse = (await import("../models/teacherCourseModel.js")).default;
    const hasMappings = await TeacherCourse.exists({ languageId: id });
    if (hasMappings) {
      return res.status(400).json({
        message: "Cannot delete language with existing teacher mappings. Deactivate it instead.",
      });
    }

    await language.deleteOne();
    res.json({ success: true, message: "Language deleted successfully" });
  } catch (err) {
    next(err);
  }
};


