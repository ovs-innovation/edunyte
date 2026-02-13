import TeacherCourse from "../models/teacherCourseModel.js";
import Course from "../models/courseModel.js";
import Language from "../models/languageModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { normalizeLanguageValue, getLanguageValue } from "../utils/languageHelper.js";
import { getBaseCurrency } from "../utils/currencyHelper.js";
import iso6391 from "iso-639-1";
import { buildTeacherCoursePricing, computeSlotBaseAmountUSD } from "../utils/pricingHelper.js";

/**
 * TeacherCourse Controller
 * Handles teacher course join requests and admin approvals
 */

const getLanguageDisplayName = (code, langNameField) => {
  const fromDoc = getLanguageValue(langNameField);
  const upperCode = (code || "").toString().toUpperCase();
  if (fromDoc && fromDoc.toString().toUpperCase() !== upperCode) {
    return fromDoc;
  }
  const fromLib = iso6391.getName(upperCode.toLowerCase());
  if (fromLib) return fromLib;
  return upperCode || "Unknown";
};

const attachLanguagesView = (tcObj) => {
  const rawLanguages = Array.isArray(tcObj.languageIds) ? tcObj.languageIds : [];
  const rawProficiencies = Array.isArray(tcObj.languageProficiencies) ? tcObj.languageProficiencies : [];

  const proficiencyByCode = new Map();
  rawProficiencies.forEach((p) => {
    if (!p) return;
    const code = typeof p.code === "string" ? p.code.trim().toUpperCase() : "";
    if (!code) return;
    proficiencyByCode.set(code, typeof p.proficiency === "string" ? p.proficiency : "native");
  });

  const languages = rawLanguages
    .map((lang) => {
      if (!lang) return null;
      const code = typeof lang.code === "string" ? lang.code.trim().toUpperCase() : "";
      const name = getLanguageDisplayName(code, lang.name);
      const nativeName = getLanguageValue(lang.nativeName) || name;
      const proficiency = code ? (proficiencyByCode.get(code) || "native") : "native";

      return {
        languageId: lang._id ? lang._id.toString() : undefined,
        code,
        name,
        nativeName,
        proficiency,
      };
    })
    .filter(Boolean);

  delete tcObj.languageIds;
  delete tcObj.languageProficiencies;
  tcObj.languages = languages;
  return tcObj;
};

const resolveLanguageIds = async ({ languageIds, languageCodes, languages }) => {
  if (Array.isArray(languageIds) && languageIds.length > 0) {
    return languageIds;
  }

  const derivedLanguages = Array.isArray(languages) ? languages : [];
  const derivedCodesFromLanguages = derivedLanguages.map((l) => l?.code);
  const derivedCodes = derivedCodesFromLanguages.length > 0 ? derivedCodesFromLanguages : languageCodes;

  if (!Array.isArray(derivedCodes) || derivedCodes.length === 0) return [];

  const codes = Array.from(new Set(
    derivedCodes
      .map((c) => (typeof c === "string" ? c.trim().toUpperCase() : ""))
      .filter(Boolean)
  ));

  if (codes.length === 0) return [];

  const payloadByCode = new Map();
  derivedLanguages.forEach((l) => {
    const code = typeof l?.code === "string" ? l.code.trim().toUpperCase() : "";
    if (!code) return;
    payloadByCode.set(code, {
      name: l?.name,
      nativeName: l?.nativeName,
    });
  });

  const existing = await Language.find({ code: { $in: codes } });
  const existingCodes = new Set(existing.map((l) => l.code));
  const missingCodes = codes.filter((c) => !existingCodes.has(c));

  if (missingCodes.length > 0) {
    try {
      await Language.insertMany(
        missingCodes.map((code) => {
          const payload = payloadByCode.get(code);
          const rawName = payload?.name;
          const rawNativeName = payload?.nativeName;

          const name =
            typeof rawName === "string"
              ? { en: rawName }
              : rawName && typeof rawName === "object"
                ? rawName
                : { en: code };

          const nativeName =
            typeof rawNativeName === "string"
              ? { en: rawNativeName }
              : rawNativeName && typeof rawNativeName === "object"
                ? rawNativeName
                : { en: code };

          return {
            code,
            name,
            nativeName,
            status: "active",
          };
        }),
        { ordered: false }
      );
    } catch (e) {
      // Ignore duplicate key races; we'll re-fetch below
    }
  }

  // Upgrade placeholder names (e.g. {en: "AB"}) when richer payload is provided
  const updates = [];
  existing.forEach((lang) => {
    const payload = payloadByCode.get(lang.code);
    if (!payload) return;
    const currentNameEn = typeof lang?.name === "object" && lang.name?.en ? String(lang.name.en) : "";
    const currentNativeEn = typeof lang?.nativeName === "object" && lang.nativeName?.en ? String(lang.nativeName.en) : "";
    const desiredNameEn =
      typeof payload?.name === "string"
        ? String(payload.name)
        : payload?.name?.en
          ? String(payload.name.en)
          : "";
    const desiredNativeEn =
      typeof payload?.nativeName === "string"
        ? String(payload.nativeName)
        : payload?.nativeName?.en
          ? String(payload.nativeName.en)
          : "";

    const isPlaceholderName = currentNameEn && currentNameEn.toUpperCase() === lang.code;
    const isPlaceholderNative = currentNativeEn && currentNativeEn.toUpperCase() === lang.code;

    if ((isPlaceholderName && desiredNameEn && desiredNameEn !== currentNameEn) || (isPlaceholderNative && desiredNativeEn && desiredNativeEn !== currentNativeEn)) {
      updates.push({
        updateOne: {
          filter: { _id: lang._id },
          update: {
            ...(isPlaceholderName && desiredNameEn
              ? {
                  name:
                    typeof payload.name === "string"
                      ? { en: payload.name }
                      : payload.name,
                }
              : {}),
            ...(isPlaceholderNative && desiredNativeEn
              ? {
                  nativeName:
                    typeof payload.nativeName === "string"
                      ? { en: payload.nativeName }
                      : payload.nativeName,
                }
              : {}),
          },
        },
      });
    }
  });
  if (updates.length > 0) {
    try {
      await Language.bulkWrite(updates, { ordered: false });
    } catch (e) {
      // best-effort
    }
  }

  const finalLanguages = await Language.find({ code: { $in: codes } });
  return finalLanguages.map((l) => l._id.toString());
};

/**
 * Teacher: Join a course (create request)
 */
export const joinCourse = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    // Teacher inputs (new API): teacherPrice + teacherCurrency
    // Backward compatible: price + currency
    const {
      courseId,
      languageIds,
      languageCodes,
      languages: languagesPayload,
      teacherPrice,
      teacherCurrency,
      price, // legacy
      currency, // legacy
      timezone,
      introductionVideo,

      bio,
      aboutCourse,
    } = req.body;

    const baseCurrency = getBaseCurrency(); // "USD"
    const resolvedTeacherPrice = typeof teacherPrice === "number" ? teacherPrice : (typeof price === "number" ? price : 0);
    const resolvedTeacherCurrency = (teacherCurrency || currency || baseCurrency).toString().toUpperCase();
    const pricing = await buildTeacherCoursePricing({
      teacherPrice: resolvedTeacherPrice,
      teacherCurrency: resolvedTeacherCurrency,
    });

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
    const resolvedLanguageIds = await resolveLanguageIds({ languageIds, languageCodes, languages: languagesPayload });
    if (!Array.isArray(resolvedLanguageIds) || resolvedLanguageIds.length === 0) {
      return res.status(400).json({ message: "At least one language is required" });
    }

    const dbLanguages = await Language.find({ _id: { $in: resolvedLanguageIds } });
    if (dbLanguages.length !== resolvedLanguageIds.length) {
      return res.status(404).json({ message: "One or more languages not found" });
    }

    const inactiveLanguages = dbLanguages.filter((lang) => lang.status !== "active");
    if (inactiveLanguages.length > 0) {
      return res.status(400).json({ message: "One or more languages are not active" });
    }

    const proficiencyByCode = new Map();
    if (Array.isArray(req.body.languages)) {
      req.body.languages.forEach((l) => {
        const code = typeof l?.code === "string" ? l.code.trim().toUpperCase() : "";
        if (!code) return;
        const p = typeof l?.proficiency === "string" ? l.proficiency : "native";
        proficiencyByCode.set(code, p);
      });
    }
    const languageProficiencies = dbLanguages.map((lang) => ({
      languageId: lang._id,
      code: lang.code,
      proficiency: proficiencyByCode.get(lang.code) || "native",
    }));

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
      existing.languageIds = resolvedLanguageIds;
      existing.languageProficiencies = languageProficiencies;
      existing.pricing = pricing;
      existing.timezone = timezone || "UTC";
      existing.introductionVideo = introductionVideo || "";

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

      existingObj.bio = getLanguageValue(existingObj.bio);
      existingObj.aboutCourse = getLanguageValue(existingObj.aboutCourse);
      attachLanguagesView(existingObj);
      return res.json({ teacherCourse: existingObj, message: "Request resubmitted successfully" });
    }

    // Create new request with multiple languages
    const teacherCourse = await TeacherCourse.create({
      teacherId,
      courseId,
      languageIds: resolvedLanguageIds,
      languageProficiencies,
      pricing,
      timezone: timezone || "UTC",
      introductionVideo: introductionVideo || "",

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

    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    attachLanguagesView(tcObj);
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

    const teacherCoursesData = teacherCourses.map((tc) => {
      const tcObj = tc.toObject();

      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
      attachLanguagesView(tcObj);
      return tcObj;
    });

    res.json({ teacherCourses: teacherCoursesData, count: teacherCoursesData.length });
  } catch (err) {
    next(err);
  }
};

/**
 * Teacher: Update a course request
 */
export const updateCourseRequest = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { id } = req.params;
    const {
      languageIds,
      languageCodes,
      languages,
      teacherPrice,
      teacherCurrency,
      price, // legacy
      currency, // legacy
      timezone,
      introductionVideo,

      bio,
      aboutCourse,
    } = req.body;
    const baseCurrency = getBaseCurrency();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course request ID" });
    }

    // Verify user is a teacher
    const user = await User.findById(teacherId);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can update course requests" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Course request not found" });
    }

    // Verify the teacher owns this request
    if (teacherCourse.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: "You can only update your own course requests" });
    }

    // Only allow updates if status is pending or rejected
    if (teacherCourse.status === "approved") {
      return res.status(400).json({ message: "Cannot update an approved course request. Please contact admin." });
    }

    // Update fields
    if (languageIds !== undefined || languageCodes !== undefined || languages !== undefined) {
      const resolvedLanguageIds = await resolveLanguageIds({ languageIds, languageCodes, languages });
      if (!Array.isArray(resolvedLanguageIds) || resolvedLanguageIds.length === 0) {
        return res.status(400).json({ message: "At least one language is required" });
      }

      const langs = await Language.find({ _id: { $in: resolvedLanguageIds } });
      if (langs.length !== resolvedLanguageIds.length) {
        return res.status(404).json({ message: "One or more languages not found" });
      }

      const inactive = langs.filter((l) => l.status !== "active");
      if (inactive.length > 0) {
        return res.status(400).json({ message: "One or more languages are not active" });
      }

      teacherCourse.languageIds = resolvedLanguageIds;
      const proficiencyByCode = new Map();
      if (Array.isArray(req.body.languages)) {
        req.body.languages.forEach((l) => {
          const code = typeof l?.code === "string" ? l.code.trim().toUpperCase() : "";
          if (!code) return;
          const p = typeof l?.proficiency === "string" ? l.proficiency : "native";
          proficiencyByCode.set(code, p);
        });
      }
      teacherCourse.languageProficiencies = langs.map((lang) => ({
        languageId: lang._id,
        code: lang.code,
        proficiency: proficiencyByCode.get(lang.code) || "native",
      }));
    }
    if (teacherPrice !== undefined || teacherCurrency !== undefined || price !== undefined || currency !== undefined) {
      const resolvedTeacherPrice =
        typeof teacherPrice === "number"
          ? teacherPrice
          : typeof price === "number"
            ? price
            : teacherCourse?.pricing?.teacherPrice || 0;
      const resolvedTeacherCurrency = (teacherCurrency || currency || teacherCourse?.pricing?.teacherCurrency || baseCurrency).toString().toUpperCase();
      teacherCourse.pricing = await buildTeacherCoursePricing({
        teacherPrice: resolvedTeacherPrice,
        teacherCurrency: resolvedTeacherCurrency,
      });
    }
    if (timezone !== undefined) {
      teacherCourse.timezone = timezone;
    }
    if (introductionVideo !== undefined) {
      teacherCourse.introductionVideo = introductionVideo;
    }

    if (bio !== undefined) {
      teacherCourse.bio = normalizeLanguageValue(bio);
    }
    if (aboutCourse !== undefined) {
      teacherCourse.aboutCourse = normalizeLanguageValue(aboutCourse);
    }

    // Reset status to pending if it was rejected
    if (teacherCourse.status === "rejected") {
      teacherCourse.status = "pending";
      teacherCourse.rejectionReason = "";
    }

    await teacherCourse.save();
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code" },
    ]);

    const teacherCourseObj = teacherCourse.toObject();

    teacherCourseObj.bio = getLanguageValue(teacherCourseObj.bio);
    teacherCourseObj.aboutCourse = getLanguageValue(teacherCourseObj.aboutCourse);
    attachLanguagesView(teacherCourseObj);

    res.json({ teacherCourse: teacherCourseObj, message: "Course request updated successfully" });
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

    const teacherCoursesData = teacherCourses.map((tc) => {
      const tcObj = tc.toObject();

      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
      attachLanguagesView(tcObj);
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
      { path: "languageIds", select: "name code nativeName" },
      { path: "reviewedBy", select: "name email" },
    ]);

    const tcObj = teacherCourse.toObject();

    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    attachLanguagesView(tcObj);
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
      { path: "languageIds", select: "name code nativeName" },
      { path: "reviewedBy", select: "name email" },
    ]);

    const tcObj = teacherCourse.toObject();

    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    attachLanguagesView(tcObj);
    res.json({ teacherCourse: tcObj, message: "Request rejected successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update a teacher-course (e.g., custom platform fee)
 */
export const updateTeacherCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customPlatformFeePercent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const teacherCourse = await TeacherCourse.findById(id);
    if (!teacherCourse) {
      return res.status(404).json({ message: "Teacher course not found" });
    }

    // Update custom platform fee if provided
    if (customPlatformFeePercent !== undefined) {
      const feePercent = parseFloat(customPlatformFeePercent);
      if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
        return res.status(400).json({ message: "Platform fee must be between 0 and 100" });
      }
      console.log(`[TeacherCourse Update] Setting custom fee for ${id}: ${feePercent}%`);
      teacherCourse.customPlatformFeePercent = feePercent;
    }

    await teacherCourse.save();
    console.log(`[TeacherCourse Update] Saved custom fee: ${teacherCourse.customPlatformFeePercent}%`);
    
    await teacherCourse.populate([
      { path: "teacherId", select: "name email" },
      { path: "courseId", select: "name description category image status" },
      { path: "languageIds", select: "name code nativeName" },
      { path: "reviewedBy", select: "name email" },
    ]);

    const tcObj = teacherCourse.toObject();
    tcObj.bio = getLanguageValue(tcObj.bio);
    tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
    attachLanguagesView(tcObj);
    
    res.json({ teacherCourse: tcObj, message: "Teacher course updated successfully" });
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
      // Sort by cheapest in USD base
      .sort({ "pricing.basePriceUSD": 1 });

    const teacherCoursesData = teacherCourses.map((tc) => {
      const tcObj = tc.toObject();

      tcObj.bio = getLanguageValue(tcObj.bio);
      tcObj.aboutCourse = getLanguageValue(tcObj.aboutCourse);
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
    const { startDate, endDate } = req.query;

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
      // Sort by cheapest in USD base
      .sort({ "pricing.basePriceUSD": 1 });

    // Get teacher profiles and availability for each teacher
    const TeacherProfile = (await import("../models/teacherProfileModel.js")).default;
    const Availability = (await import("../models/availabilityModel.js")).default;
    const { getLanguageValue } = await import("../utils/languageHelper.js");

    const now = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30); // Next 30 days

    const teachersData = await Promise.all(
      teacherCourses.map(async (tc) => {
        const tcObj = tc.toObject();
  
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
        const availabilityQuery = {
          teacherId: tc.teacherId,
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
          .limit(50); // Limit to first 50 slots for performance

        tcObj.availability = availabilities.map((av) => ({
          _id: av._id,
          date: av.date,
          startTime: av.startTime,
          endTime: av.endTime,
          duration: av.duration,
          // Base amount in USD (display-only conversions happen on client)
          pricing: av.pricing?.baseAmountUSD !== undefined
            ? av.pricing
            : {
                baseAmountUSD: computeSlotBaseAmountUSD({
                  basePriceUSDPerHour: tcObj?.pricing?.basePriceUSD || 0,
                  durationMinutes: av.duration,
                }),
                baseCurrency,
              },
          timezone: av.timezone,
        }));

        return tcObj;
      })
    );

    res.json({ teachers: teachersData, count: teachersData.length });
  } catch (err) {
    next(err);
  }
};

