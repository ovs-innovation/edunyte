import Course from "../models/courseModel.js";
import mongoose from "mongoose";

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

    // Check if course with same name already exists
    const existing = await Course.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return res.status(409).json({ message: "Course with this name already exists" });
    }

    const course = await Course.create({
      name,
      description,
      category,
      image,
      status: status || "active",
      createdBy,
    });

    await course.populate("createdBy", "name email");
    res.status(201).json({ course });
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
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ courses, count: courses.length });
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

    res.json({ course });
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

    // Check for duplicate name if name is being updated
    if (name && name !== course.name) {
      const existing = await Course.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (existing) {
        return res.status(409).json({ message: "Course with this name already exists" });
      }
      course.name = name;
    }

    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (image !== undefined) course.image = image;
    if (status !== undefined) course.status = status;

    await course.save();
    await course.populate("createdBy", "name email");
    res.json({ course });
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

