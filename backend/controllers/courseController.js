import Course from "../models/courseModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue, transformLanguageFields } from "../utils/languageHelper.js";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const ensureCourseSlug = async (courseDoc) => {
  if (!courseDoc) return;
  const currentSlug = getLanguageValue(courseDoc.slug);
  if (currentSlug) return;

  const nameValue = getLanguageValue(courseDoc.name);
  const baseSlug = slugify(nameValue);
  if (!baseSlug) return;

  let slugValue = baseSlug;
  let counter = 1;
  while (await Course.findOne({ "slug.en": slugValue, _id: { $ne: courseDoc._id } })) {
    slugValue = `${baseSlug}-${counter}`;
    counter++;
  }

  courseDoc.slug = { en: slugValue };
  await courseDoc.save();
};

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
    courseObj.slug = getLanguageValue(courseObj.slug);
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
    const { status, search, category } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      const Category = (await import("../models/categoryModel.js")).default;
      let categoryDoc;
      
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ "slug.en": category });
      }
      
      if (categoryDoc) {
        const categoryName = getLanguageValue(categoryDoc.name);
        query.$or = [
          { category: categoryName },
          { "category.en": categoryName }
        ];
      }
    }

    if (search) {
      const searchQuery = {
        $or: [
          { "name.en": { $regex: search, $options: "i" } },
          { "description.en": { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      };
      
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          searchQuery
        ];
        delete query.$or;
      } else {
        Object.assign(query, searchQuery);
      }
    }

    const courses = await Course.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Backfill slug for older records created before slug existed
    for (const c of courses) {
      // eslint-disable-next-line no-await-in-loop
      await ensureCourseSlug(c);
    }

    const coursesData = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.name = getLanguageValue(courseObj.name);
      courseObj.description = getLanguageValue(courseObj.description);
      courseObj.slug = getLanguageValue(courseObj.slug);
      return courseObj;
    });

    res.json({ courses: coursesData, count: coursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single course by ID or slug
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let course;

    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id).populate("createdBy", "name email");
    } else {
      course = await Course.findOne({ "slug.en": id }).populate("createdBy", "name email");
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await ensureCourseSlug(course);

    const courseObj = course.toObject();
    courseObj.name = getLanguageValue(courseObj.name);
    courseObj.description = getLanguageValue(courseObj.description);
    courseObj.slug = getLanguageValue(courseObj.slug);
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
    courseObj.slug = getLanguageValue(courseObj.slug);
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

