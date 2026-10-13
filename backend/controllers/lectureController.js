import Lecture from "../models/lectureModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import { normalizeLanguageValue, getLanguageValue } from "../utils/languageHelper.js";

/**
 * Upload video file buffer directly to Cloudinary
 */
export const uploadVideoToCloudinary = async (fileBuffer, originalname = "video.mp4") => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "di4pzesyi";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "VOLTOMATIC_CLOUDINARY_UPLOAD_PRESET";

  // Try verified preset upload first (works with di4pzesyi)
  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "video/mp4" });
    formData.append("file", blob, originalname);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "edunyte/course_lectures");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok && (data.secure_url || data.url)) {
      return data;
    }
    console.warn("Direct Cloudinary preset upload response:", data);
  } catch (err) {
    console.warn("Direct Cloudinary preset upload attempt error:", err.message);
  }

  // Fallback to Cloudinary SDK signed stream
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "edunyte/course_lectures",
        chunk_size: 6000000, // 6MB chunks
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary video upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Handle direct video upload via multipart/form-data
 */
export const uploadLectureVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    const { courseId } = req.params;
    if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const result = await uploadVideoToCloudinary(req.file.buffer, req.file.originalname);

    // Duration in minutes (rounded to 1 decimal place)
    const durationMinutes = result.duration ? Math.round((result.duration / 60) * 10) / 10 : 0;

    res.status(200).json({
      message: "Video uploaded successfully",
      videoUrl: result.secure_url || result.url,
      videoPublicId: result.public_id,
      videoDuration: durationMinutes,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new lecture for a course (Admin)
 */
export const createLecture = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const createdBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const {
      title,
      description,
      section,
      type,
      videoUrl,
      videoPublicId,
      videoDuration,
      liveMeeting,
      order,
      isPreview,
      status,
    } = req.body;

    const normalizedTitle = normalizeLanguageValue(title);
    const normalizedDescription = normalizeLanguageValue(description);

    // Determine order if not specified
    let lectureOrder = order;
    if (lectureOrder === undefined || lectureOrder === null) {
      const lastLecture = await Lecture.findOne({ courseId }).sort({ order: -1 });
      lectureOrder = lastLecture ? (lastLecture.order || 0) + 1 : 0;
    }

    const lecture = await Lecture.create({
      courseId,
      title: normalizedTitle,
      description: normalizedDescription,
      section: section || "General",
      type: type || "recorded",
      videoUrl: videoUrl || "",
      videoPublicId: videoPublicId || "",
      videoDuration: Number(videoDuration) || 0,
      liveMeeting: liveMeeting || {
        provider: "google_meet",
        meetingUrl: "",
        meetingId: "",
        scheduledAt: null,
        duration: 60,
        status: "scheduled",
      },
      order: lectureOrder,
      isPreview: Boolean(isPreview),
      status: status || "active",
      createdBy,
    });

    const lectureObj = lecture.toObject();
    lectureObj.title = getLanguageValue(lectureObj.title);
    lectureObj.description = getLanguageValue(lectureObj.description);

    res.status(201).json({ lecture: lectureObj, message: "Lecture created successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all lectures for a course (Admin)
 */
export const getCourseLectures = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { type, status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const query = { courseId };
    if (type) query.type = type;
    if (status) query.status = status;

    const lectures = await Lecture.find(query)
      .sort({ order: 1, createdAt: 1 })
      .populate("createdBy", "name email");

    const formattedLectures = lectures.map((lec) => {
      const obj = lec.toObject();
      obj.title = getLanguageValue(obj.title);
      obj.description = getLanguageValue(obj.description);
      return obj;
    });

    res.json({
      lectures: formattedLectures,
      count: formattedLectures.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get public lectures for a course (Students / Public)
 */
export const getPublicCourseLectures = async (req, res, next) => {
  try {
    const { courseIdentifier } = req.params;
    let course = null;

    if (mongoose.Types.ObjectId.isValid(courseIdentifier)) {
      course = await Course.findById(courseIdentifier);
    }

    if (!course) {
      course = await Course.findOne({
        $or: [
          { "slug.en": courseIdentifier },
          { slug: courseIdentifier },
        ],
      });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lectures = await Lecture.find({
      courseId: course._id,
      status: "active",
    }).sort({ order: 1, createdAt: 1 });

    const formattedLectures = lectures.map((lec) => {
      const obj = lec.toObject();
      obj.title = getLanguageValue(obj.title);
      obj.description = getLanguageValue(obj.description);
      return obj;
    });

    res.json({
      lectures: formattedLectures,
      count: formattedLectures.length,
      course: {
        _id: course._id,
        name: getLanguageValue(course.name),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single lecture by ID
 */
export const getLectureById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lecture ID" });
    }

    const lecture = await Lecture.findById(id).populate("createdBy", "name email");
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const lectureObj = lecture.toObject();
    lectureObj.title = getLanguageValue(lectureObj.title);
    lectureObj.description = getLanguageValue(lectureObj.description);

    res.json({ lecture: lectureObj });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a lecture (Admin)
 */
export const updateLecture = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lecture ID" });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const {
      title,
      description,
      section,
      type,
      videoUrl,
      videoPublicId,
      videoDuration,
      liveMeeting,
      order,
      isPreview,
      status,
    } = req.body;

    if (title !== undefined) {
      lecture.title = normalizeLanguageValue(title);
    }
    if (description !== undefined) {
      lecture.description = normalizeLanguageValue(description);
    }
    if (section !== undefined) lecture.section = section;
    if (type !== undefined) lecture.type = type;
    if (videoUrl !== undefined) lecture.videoUrl = videoUrl;
    if (videoPublicId !== undefined) lecture.videoPublicId = videoPublicId;
    if (videoDuration !== undefined) lecture.videoDuration = Number(videoDuration) || 0;
    if (liveMeeting !== undefined) {
      lecture.liveMeeting = {
        ...lecture.liveMeeting?.toObject(),
        ...liveMeeting,
      };
    }
    if (order !== undefined) lecture.order = Number(order) || 0;
    if (isPreview !== undefined) lecture.isPreview = Boolean(isPreview);
    if (status !== undefined) lecture.status = status;

    await lecture.save();

    const lectureObj = lecture.toObject();
    lectureObj.title = getLanguageValue(lectureObj.title);
    lectureObj.description = getLanguageValue(lectureObj.description);

    res.json({ lecture: lectureObj, message: "Lecture updated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a lecture (Admin)
 */
export const deleteLecture = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lecture ID" });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Attempt to delete video asset from Cloudinary if it exists
    if (lecture.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(lecture.videoPublicId, { resource_type: "video" });
      } catch (cloudErr) {
        console.warn("Could not delete video from Cloudinary:", cloudErr.message);
      }
    }

    await Lecture.findByIdAndDelete(id);

    res.json({ message: "Lecture deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Reorder lectures
 */
export const reorderLectures = async (req, res, next) => {
  try {
    const { lectures } = req.body; // Array of { id, order }

    if (!Array.isArray(lectures)) {
      return res.status(400).json({ message: "Lectures array is required" });
    }

    const updatePromises = lectures.map(({ id, order }) => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return Lecture.findByIdAndUpdate(id, { order: Number(order) || 0 });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    res.json({ message: "Lectures reordered successfully" });
  } catch (err) {
    next(err);
  }
};
