import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";

export const getStudentProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }
    let profile = await StudentProfile.findOne({ userId }).populate("userId", "name email status");
    if (!profile) {
      profile = await StudentProfile.create({ userId });
      profile = await StudentProfile.findById(profile._id).populate("userId", "name email status");
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const listStudentProfiles = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let profiles = await StudentProfile.find()
      .populate("userId", "name email status")
      .sort({ createdAt: -1 });
    if (status) {
      profiles = profiles.filter((p) => p.userId?.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.userId?.name?.toLowerCase().includes(searchLower) ||
          p.userId?.email?.toLowerCase().includes(searchLower)
      );
    }
    res.json({ profiles, count: profiles.length });
  } catch (err) {
    next(err);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }
    const { photo, phone, progress } = req.body;
    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }
    if (photo !== undefined) profile.photo = photo;
    if (phone !== undefined) profile.phone = phone;
    if (progress) {
      if (progress.totalHoursSpent !== undefined) {
        profile.progress.totalHoursSpent = progress.totalHoursSpent;
      }
      if (progress.totalLessonsCompleted !== undefined) {
        profile.progress.totalLessonsCompleted = progress.totalLessonsCompleted;
      }
    }
    await profile.save();
    await profile.populate("userId", "name email status");
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const addCertificate = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { courseId, certificateId, certificateUrl, courseName } = req.body;
    if (!courseId || !certificateId) {
      return res.status(400).json({ message: "Course ID and Certificate ID are required" });
    }
    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    const existingCert = profile.certificates.find(
      (c) => c.certificateId === certificateId
    );
    if (existingCert) {
      return res.status(409).json({ message: "Certificate already exists" });
    }
    profile.certificates.push({
      courseId,
      certificateId,
      certificateUrl: certificateUrl || "",
      courseName: courseName || "",
      issuedAt: new Date(),
    });
    await profile.save();
    await profile.populate("userId", "name email status");
    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
};
