import Language from "../models/languageModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue } from "../utils/languageHelper.js";

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

    const normalizedName = normalizeLanguageValue(name);
    const normalizedNativeName = normalizeLanguageValue(nativeName);
    const nameValue = getLanguageValue(normalizedName);

    const existing = await Language.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${nameValue}$`, "i") } },
        { name: { $regex: new RegExp(`^${nameValue}$`, "i") } },
        { code: code.toUpperCase() },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: "Language with this name or code already exists" });
    }

    const language = await Language.create({
      name: normalizedName,
      code: code.toUpperCase(),
      nativeName: normalizedNativeName,
      flag,
      status: status || "active",
    });

    const languageObj = language.toObject();
    languageObj.name = getLanguageValue(languageObj.name);
    languageObj.nativeName = getLanguageValue(languageObj.nativeName);
    res.status(201).json({ language: languageObj });
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
        { "name.en": { $regex: search, $options: "i" } },
        { "nativeName.en": { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { nativeName: { $regex: search, $options: "i" } },
      ];
    }

    const languages = await Language.find(query).sort({ createdAt: -1 });
    const languagesData = languages.map(language => {
      const languageObj = language.toObject();
      languageObj.name = getLanguageValue(languageObj.name);
      languageObj.nativeName = getLanguageValue(languageObj.nativeName);
      return languageObj;
    });
    res.json({ languages: languagesData, count: languagesData.length });
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

    const languageObj = language.toObject();
    languageObj.name = getLanguageValue(languageObj.name);
    languageObj.nativeName = getLanguageValue(languageObj.nativeName);
    res.json({ language: languageObj });
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

    if (name !== undefined || code !== undefined) {
      const updateQuery = { _id: { $ne: id } };
      const orConditions = [];
      
      if (name) {
        const normalizedName = normalizeLanguageValue(name);
        const nameValue = getLanguageValue(normalizedName);
        orConditions.push(
          { "name.en": { $regex: new RegExp(`^${nameValue}$`, "i") } },
          { name: { $regex: new RegExp(`^${nameValue}$`, "i") } }
        );
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

    if (name !== undefined) language.name = normalizeLanguageValue(name);
    if (code !== undefined) language.code = code.toUpperCase();
    if (nativeName !== undefined) language.nativeName = normalizeLanguageValue(nativeName);
    if (flag !== undefined) language.flag = flag;
    if (status !== undefined) language.status = status;

    await language.save();
    const languageObj = language.toObject();
    languageObj.name = getLanguageValue(languageObj.name);
    languageObj.nativeName = getLanguageValue(languageObj.nativeName);
    res.json({ language: languageObj });
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


