import Course from "../models/courseModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue, transformLanguageFields } from "../utils/languageHelper.js";

/**
 * Course Controller
 * Admin-only operations for managing courses
 */

/**
 * Create a new course (Admin only)
 */
export const createCourse = async (req, res, next) => {
  try {
    const { name, description, category, image, status } = req.body;
    const createdBy = req.user.id;

    const normalizedName = normalizeLanguageValue(name);
    const normalizedDescription = normalizeLanguageValue(description);
    const nameValue = getLanguageValue(normalizedName);

    const existing = await Course.findOne({
      $or: [
        { "name.en": { $regex: new RegExp(`^${nameValue}$`, "i") } },
        { name: { $regex: new RegExp(`^${nameValue}$`, "i") } }
      ]
    });
    if (existing) {
      return res.status(409).json({ message: "Course with this name already exists" });
    }

    const course = await Course.create({
      name: normalizedName,
      description: normalizedDescription,
      category,
      image,
      status: status || "active",
      createdBy,
    });

    await course.populate("createdBy", "name email");
    const courseObj = course.toObject();
    courseObj.name = getLanguageValue(courseObj.name);
    courseObj.description = getLanguageValue(courseObj.description);
    res.status(201).json({ course: courseObj });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all courses (Admin)
 */
export const getCourses = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "name.en": { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const coursesData = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.name = getLanguageValue(courseObj.name);
      courseObj.description = getLanguageValue(courseObj.description);
      return courseObj;
    });

    res.json({ courses: coursesData, count: coursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id).populate("createdBy", "name email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseObj = course.toObject();
    courseObj.name = getLanguageValue(courseObj.name);
    courseObj.description = getLanguageValue(courseObj.description);
    res.json({ course: courseObj });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a course (Admin only)
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const { name, description, category, image, status } = req.body;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (name !== undefined) {
      const normalizedName = normalizeLanguageValue(name);
      const nameValue = getLanguageValue(normalizedName);
      const currentNameValue = getLanguageValue(course.name);

      if (nameValue !== currentNameValue) {
        const existing = await Course.findOne({
          $or: [
            { "name.en": { $regex: new RegExp(`^${nameValue}$`, "i") } },
            { name: { $regex: new RegExp(`^${nameValue}$`, "i") } }
          ],
          _id: { $ne: id }
        });
        if (existing) {
          return res.status(409).json({ message: "Course with this name already exists" });
        }
      }
      course.name = normalizedName;
    }

    if (description !== undefined) course.description = normalizeLanguageValue(description);
    if (category !== undefined) course.category = category;
    if (image !== undefined) course.image = image;
    if (status !== undefined) course.status = status;

    await course.save();
    await course.populate("createdBy", "name email");
    const courseObj = course.toObject();
    courseObj.name = getLanguageValue(courseObj.name);
    courseObj.description = getLanguageValue(courseObj.description);
    res.json({ course: courseObj });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a course (Admin only)
 * Note: Consider soft delete or checking for existing teacher-course mappings
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course has any teacher mappings
    const TeacherCourse = (await import("../models/teacherCourseModel.js")).default;
    const hasMappings = await TeacherCourse.exists({ courseId: id });
    if (hasMappings) {
      return res.status(400).json({
        message: "Cannot delete course with existing teacher mappings. Deactivate it instead.",
      });
    }

    await course.deleteOne();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

