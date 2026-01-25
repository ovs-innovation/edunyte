import TeacherCourse from "../models/teacherCourseModel.js";
import Course from "../models/courseModel.js";
import Language from "../models/languageModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue } from "../utils/languageHelper.js";
import { convertCurrency, getBaseCurrency } from "../utils/currencyHelper.js";

/**
 * TeacherCourse Controller
 * Handles teacher course join requests and admin approvals
 */

/**
 * Teacher: Join a course (create request)
 */
export const joinCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, languageIds, price, currency, timezone, introductionVideo, experience, bio, aboutCourse } = req.body;

    // Verify user is a teacher
    const user = await User.findById(teacherId);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can join courses" });
    }

    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.status !== "active") {
      return res.status(400).json({ message: "Course is not active" });
    }

    // Verify all languages exist and are active
    if (!Array.isArray(languageIds) || languageIds.length === 0) {
      return res.status(400).json({ message: "At least one language is required" });
    }

    const languages = await Language.find({ _id: { $in: languageIds } });
    if (languages.length !== languageIds.length) {
      return res.status(404).json({ message: "One or more languages not found" });
    }

    const inactiveLanguages = languages.filter((lang) => lang.status !== "active");
    if (inactiveLanguages.length > 0) {
      return res.status(400).json({ message: "One or more languages are not active" });
    }

    // Check for existing request for this teacher-course combination
    const existing = await TeacherCourse.findOne({
      teacherId,
      courseId,
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(409).json({ message: "Request already pending for this course" });
      }
      if (existing.status === "approved") {
        return res.status(409).json({ message: "You are already approved for this course" });
      }
      // If rejected, allow re-application
      existing.status = "pending";
      existing.languageIds = languageIds;
      existing.price = price;
      existing.currency = (currency || getBaseCurrency()).toUpperCase();
      existing.timezone = timezone || "UTC";
      existing.introductionVideo = introductionVideo || "";
      existing.experience = normalizeLanguageValue(experience);
      existing.bio = normalizeLanguageValue(bio);
      existing.aboutCourse = normalizeLanguageValue(aboutCourse);
      existing.rejectionReason = "";
      await existing.save();
      await existing.populate([
        { path: "teacherId", select: "name email" },
        { path: "courseId", select: "name description category image status" },
        { path: "languageIds", select: "name code" },
      ]);
      const existingObj = existing.toObject();
      existingObj.experience = getLanguageValue(existingObj.experience);
      existingObj.bio = getLanguageValue(existingObj.bio);
      existingObj.aboutCourse = getLanguageValue(existingObj.aboutCourse);
      return res.json({ teacherCourse: existingObj, message: "Request resubmitted successfully" });
    }

    // Create new request with multiple languages
    const teacherCourse = await TeacherCourse.create({
      teacherId,
      courseId,
      languageIds,
      price,
      currency: (currency || getBaseCurrency()).toUpperCase(),
      timezone: timezone || "UTC",
      introductionVideo: introductionVideo || "",
      experience: normalizeLanguageValue(experience),
      bio: normalizeLanguageValue(bio),
      aboutCourse: normalizeLanguageValue(aboutCourse),
      status: "pending",
    });

    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
    ]);

    const tcObj = teacherCourse.toObject();
    tcObj.experience = getLanguageValue(tcObj.experience);
    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    res.status(201).json({ teacherCourse: tcObj });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate request for this course-language combination" });
    }
    next(err);
  }
};

/**
 * Teacher: Get my course requests
 */
export const getMyCourses = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { status } = req.query;

    const query = { teacherId };
    if (status) {
      query.status = status;
    }

    const teacherCourses = await TeacherCourse.find(query)
      .populate("courseId", "name description category image status")
      .populate("languageIds", "name code nativeName")
      .sort({ createdAt: -1 });

    const targetCurrency = req.query.currency || getBaseCurrency();
    const teacherCoursesData = teacherCourses.map(tc => {
      const tcObj = tc.toObject();
      tcObj.experience = getLanguageValue(tcObj.experience);
      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
      if (tcObj.price && tcObj.currency && tcObj.currency !== targetCurrency) {
        tcObj.price = convertCurrency(tcObj.price, tcObj.currency, targetCurrency);
        tcObj.currency = targetCurrency;
      }
      return tcObj;
    });

    res.json({ teacherCourses: teacherCoursesData, count: teacherCoursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Teacher: Exit/Leave a course
 */
export const exitCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course request ID" });
    }

    // Verify user is a teacher
    const user = await User.findById(teacherId);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can exit courses" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Course request not found" });
    }

    // Verify the teacher owns this request
    if (teacherCourse.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You can only exit your own course requests" });
    }

    // Check for upcoming bookings (optional - you may want to prevent exit if there are bookings)
    // For now, we'll allow exit regardless, but you can add this check if needed
    // const Booking = (await import("../models/bookingModel.js")).default;
    // const upcomingBookings = await Booking.find({
    //   teacherCourseId: id,
    //   sessionDate: { $gte: new Date() },
    //   status: { $in: ["pending", "confirmed"] }
    // });
    // if (upcomingBookings.length > 0) {
    //   return res.status(400).json({ 
    //     message: `Cannot exit course. You have ${upcomingBookings.length} upcoming booking(s). Please cancel them first.` 
    //   });
    // }

    // Delete the teacher course entry
    await TeacherCourse.findByIdAndDelete(id);

    res.json({ message: "Successfully exited from the course" });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all teacher course requests
 */
export const getTeacherCourseRequests = async (req, res, next) => {
  try {
    const { status, courseId, languageId, teacherId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (courseId) {
      query.courseId = courseId;
    }
    if (languageId) {
      query.languageIds = { $in: [languageId] }; // Find courses that include this language
    }
    if (teacherId) {
      query.teacherId = teacherId;
    }

    const teacherCourses = await TeacherCourse.find(query)
      .populate("teacherId", "name email status")
      .populate("courseId", "name description category image status")
      .populate("languageIds", "name code nativeName")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const targetCurrency = req.query.currency || getBaseCurrency();
    const teacherCoursesData = teacherCourses.map(tc => {
      const tcObj = tc.toObject();
      tcObj.experience = getLanguageValue(tcObj.experience);
      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
      if (tcObj.price && tcObj.currency && tcObj.currency !== targetCurrency) {
        tcObj.price = convertCurrency(tcObj.price, tcObj.currency, targetCurrency);
        tcObj.currency = targetCurrency;
      }
      return tcObj;
    });

    res.json({ teacherCourses: teacherCoursesData, count: teacherCoursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Approve a teacher-course request
 */
export const approveTeacherCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (teacherCourse.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }

    teacherCourse.status = "approved";
    teacherCourse.reviewedBy = req.user.id;
    teacherCourse.reviewedAt = new Date();
    teacherCourse.rejectionReason = "";

    await teacherCourse.save();
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
      { path: "reviewedBy", select: "name email" },
    ]);

    const tcObj = teacherCourse.toObject();
    tcObj.experience = getLanguageValue(tcObj.experience);
    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    res.json({ teacherCourse: tcObj, message: "Request approved successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Reject a teacher-course request
 */
export const rejectTeacherCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (teacherCourse.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }

    teacherCourse.status = "rejected";
    teacherCourse.reviewedBy = req.user.id;
    teacherCourse.reviewedAt = new Date();
    teacherCourse.rejectionReason = rejectionReason || "";

    await teacherCourse.save();
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
      { path: "reviewedBy", select: "name email" },
    ]);

    const tcObj = teacherCourse.toObject();
    tcObj.experience = getLanguageValue(tcObj.experience);
    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    res.json({ teacherCourse: tcObj, message: "Request rejected successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get all available courses (only approved teacher-course mappings)
 */
export const getAvailableCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: "active" })
      .populate("createdBy", "name email")
      .sort({ name: 1 });

    res.json({ courses, count: courses.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get languages available for a course
 */
export const getCourseLanguages = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Get all approved teacher-course mappings for this course
    const teacherCourses = await TeacherCourse.find({
      courseId,
      status: "approved",
    });

    // Extract all unique language IDs from all teacher courses
    const allLanguageIds = teacherCourses.reduce((acc, tc) => {
      if (Array.isArray(tc.languageIds)) {
        tc.languageIds.forEach(langId => {
          if (!acc.includes(langId.toString())) {
            acc.push(langId.toString());
          }
        });
      }
      return acc;
    }, []);

    const languages = await Language.find({
      _id: { $in: allLanguageIds },
      status: "active",
    }).sort({ name: 1 });

    res.json({ languages, count: languages.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Student: Get teachers for a course-language combination
 */
export const getCourseTeachers = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { languageId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!languageId || !mongoose.Types.ObjectId.isValid(languageId)) {
      return res.status(400).json({ message: "Valid languageId query parameter is required" });
    }

    // Get all approved teacher-course mappings that include this language
    const teacherCourses = await TeacherCourse.find({
      courseId,
      languageIds: { $in: [languageId] },
      status: "approved",
    })
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageIds", "name code nativeName")
      .sort({ price: 1 });

    const targetCurrency = req.query.currency || getBaseCurrency();
    const teacherCoursesData = teacherCourses.map(tc => {
      const tcObj = tc.toObject();
      tcObj.experience = getLanguageValue(tcObj.experience);
      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
      if (tcObj.price && tcObj.currency && tcObj.currency !== targetCurrency) {
        tcObj.price = convertCurrency(tcObj.price, tcObj.currency, targetCurrency);
        tcObj.currency = targetCurrency;
      }
      return tcObj;
    });

    res.json({ teacherCourses: teacherCoursesData, count: teacherCoursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Get all teachers for a course by slug with availability
 */
export const getCourseTeachersBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { startDate, endDate, studentTimezone } = req.query;

    // Find course by slug
    let course;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      course = await Course.findById(slug);
    } else {
      course = await Course.findOne({ "slug.en": slug });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get all approved teacher-course mappings for this course
    const teacherCourses = await TeacherCourse.find({
      courseId: course._id,
      status: "approved",
    })
      .populate("teacherId", "name email")
      .populate("courseId", "name description")
      .populate("languageIds", "name code nativeName")
      .sort({ price: 1 });

    // Get teacher profiles and availability for each teacher
    const TeacherProfile = (await import("../models/teacherProfileModel.js")).default;
    const Availability = (await import("../models/availabilityModel.js")).default;
    const { getLanguageValue } = await import("../utils/languageHelper.js");
    const { convertTimeBetweenTimezones } = await import("../utils/timezoneHelper.js");

    const targetCurrency = req.query.currency || getBaseCurrency();
    const now = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30); // Next 30 days

    const teachersData = await Promise.all(
      teacherCourses.map(async (tc) => {
        const tcObj = tc.toObject();
        tcObj.experience = getLanguageValue(tcObj.experience);
        tcObj.bio = getLanguageValue(tcObj.bio);
        tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);

        if (tcObj.languageIds && Array.isArray(tcObj.languageIds)) {
          tcObj.languageIds = tcObj.languageIds.map((lang) => ({
            _id: lang._id,
            name: getLanguageValue(lang.name),
            code: lang.code,
            nativeName: getLanguageValue(lang.nativeName),
          }));
        }

        const teacherProfile = await TeacherProfile.findOne({ userId: tc.teacherId });
        if (teacherProfile) {
          tcObj.teacherProfile = {
            photo: teacherProfile.photo || "",
            rating: teacherProfile.rating || 0,
            totalReviews: teacherProfile.totalReviews || 0,
            totalStudents: teacherProfile.totalStudents || 0,
            experience: teacherProfile.experience || 0,
            country: teacherProfile.country || "",
            countryCode: teacherProfile.countryCode || "",
            bio: getLanguageValue(teacherProfile.bio),
          };
        } else {
          tcObj.teacherProfile = {
            photo: "",
            rating: 0,
            totalReviews: 0,
            totalStudents: 0,
            experience: 0,
            country: "",
            countryCode: "",
            bio: "",
          };
        }

        // Get availability slots
        // Extract teacherId - when populated, it's an object, so get _id
        const teacherIdForQuery = tc.teacherId?._id || tc.teacherId;
        
        const availabilityQuery = {
          teacherId: teacherIdForQuery,
          courseId: course._id,
          status: "available",
          date: { $gte: now },
        };

        if (startDate) {
          availabilityQuery.date.$gte = new Date(startDate);
        }
        if (endDate) {
          availabilityQuery.date.$lte = new Date(endDate);
        } else {
          availabilityQuery.date.$lte = defaultEndDate;
        }

        const availabilities = await Availability.find(availabilityQuery)
          .sort({ date: 1, startTime: 1 })
          .limit(50);

        if (studentTimezone) {
          availabilities = availabilities.map((av) => {
            const avObj = av.toObject();
            if (avObj.timezone && studentTimezone && avObj.timezone !== studentTimezone) {
              try {
                avObj.startTime = convertTimeBetweenTimezones(avObj.date, avObj.startTime, avObj.timezone, studentTimezone);
                avObj.endTime = convertTimeBetweenTimezones(avObj.date, avObj.endTime, avObj.timezone, studentTimezone);
                avObj.displayTimezone = studentTimezone;
                avObj.originalTimezone = avObj.timezone;
              } catch (err) {
                console.error("Timezone conversion error:", err);
                avObj.displayTimezone = avObj.timezone;
              }
            } else {
              avObj.displayTimezone = avObj.timezone || "UTC";
            }
            return avObj;
          });
        }

        tcObj.availability = availabilities.map((av) => ({
          _id: av._id,
          date: av.date,
          startTime: av.startTime,
          endTime: av.endTime,
          duration: av.duration,
          price: av.price,
          currency: av.currency,
          timezone: av.timezone,
          displayTimezone: av.displayTimezone,
        }));

        // Currency conversion
        if (tcObj.price && tcObj.currency && tcObj.currency !== targetCurrency) {
          tcObj.price = convertCurrency(tcObj.price, tcObj.currency, targetCurrency);
          tcObj.currency = targetCurrency;
        }

        return tcObj;
      })
    );

    res.json({ teachers: teachersData, count: teachersData.length });
  } catch (err) {
    next(err);
  }
};

