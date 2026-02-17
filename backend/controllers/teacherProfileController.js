import TeacherProfile from "../models/teacherProfileModel.js";
import User from "../models/userModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import Booking from "../models/bookingModel.js";
import { getLanguageValue, normalizeLanguageValue } from "../utils/languageHelper.js";

export const getTeacherProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher" });
    }
    let profile = await TeacherProfile.findOne({ userId }).populate("userId", "name email status");
    if (!profile) {
      profile = await TeacherProfile.create({ userId });
      profile = await TeacherProfile.findById(profile._id).populate("userId", "name email status");
    }

    // Calculate stats
    const totalCourses = await TeacherCourse.countDocuments({ teacherId: userId });
    const publishedCourses = await TeacherCourse.countDocuments({ teacherId: userId, status: "approved" });
    const uniqueStudents = await Booking.distinct("studentId", { teacherId: userId, paymentStatus: "paid" });

    // Calculate earnings from completed bookings
    const completedBookings = await Booking.find({
      teacherId: userId,
      status: "completed",
      paymentStatus: "paid"
    });

    let totalEarnings = 0;
    let pendingPayout = 0;

    completedBookings.forEach(booking => {
      if (booking.payout && booking.payout.teacherAmountUSD) {
        totalEarnings += booking.payout.teacherAmountUSD;
        if (booking.payout.status === "pending") {
          pendingPayout += booking.payout.teacherAmountUSD;
        }
      }
    });

    const paidAmount = totalEarnings - pendingPayout;

    // Update profile with calculated stats
    profile.totalCourses = totalCourses;
    profile.publishedCourses = publishedCourses;
    profile.totalStudents = uniqueStudents.length;
    profile.totalEarnings = totalEarnings;
    profile.pendingPayout = pendingPayout;
    profile.paidAmount = paidAmount;
    await profile.save();

    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};

export const getMyTeacherProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "User is not a teacher" });
    }
    let profile = await TeacherProfile.findOne({ userId }).populate("userId", "name email status");
    if (!profile) {
      profile = await TeacherProfile.create({ userId });
      profile = await TeacherProfile.findById(profile._id).populate("userId", "name email status");
    }

    // Calculate stats
    const totalCourses = await TeacherCourse.countDocuments({ teacherId: userId });
    const publishedCourses = await TeacherCourse.countDocuments({ teacherId: userId, status: "approved" });
    const uniqueStudents = await Booking.distinct("studentId", { teacherId: userId, paymentStatus: "paid" });

    // Calculate earnings from completed bookings
    const completedBookings = await Booking.find({
      teacherId: userId,
      status: "completed",
      paymentStatus: "paid"
    });

    let totalEarnings = 0;
    let pendingPayout = 0;

    completedBookings.forEach(booking => {
      if (booking.payout && booking.payout.teacherAmountUSD) {
        totalEarnings += booking.payout.teacherAmountUSD;
        if (booking.payout.status === "pending") {
          pendingPayout += booking.payout.teacherAmountUSD;
        }
      }
    });

    const paidAmount = totalEarnings - pendingPayout;

    // Update profile with calculated stats
    profile.totalCourses = totalCourses;
    profile.publishedCourses = publishedCourses;
    profile.totalStudents = uniqueStudents.length;
    profile.totalEarnings = totalEarnings;
    profile.pendingPayout = pendingPayout;
    profile.paidAmount = paidAmount;
    await profile.save();

    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};

export const updateTeacherProfile = async (req, res, next) => {
  try {
    // Handle /me route - use authenticated user's ID when userId param is not present
    const userId = req.params.userId || req.user.id;
    const requestingUserId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "teacher") {
      return res.status(400).json({ message: "User is not a teacher" });
    }
    const {
      bio,
      aboutUs,
      photo,
      expertise,
      experience,
      country,
      countryCode,
      socialLinks,
      payoutInfo,
      rating,
      kycStatus,
      rejectionReason,
    } = req.body;
    let profile = await TeacherProfile.findOne({ userId });
    if (!profile) {
      profile = await TeacherProfile.create({ userId });
    }
    if (bio !== undefined) profile.bio = normalizeLanguageValue(bio);
    if (aboutUs !== undefined) profile.aboutUs = normalizeLanguageValue(aboutUs);
    if (photo !== undefined) profile.photo = photo;
    if (expertise !== undefined) profile.expertise = Array.isArray(expertise) ? expertise : [];
    if (experience !== undefined) profile.experience = experience;
    if (country !== undefined) profile.country = country;
    if (countryCode !== undefined) profile.countryCode = countryCode ? countryCode.toUpperCase() : "";
    if (socialLinks !== undefined) {
      profile.socialLinks = {
        ...profile.socialLinks,
        ...socialLinks,
      };
    }
    if (payoutInfo !== undefined) {
      profile.payoutInfo = {
        ...profile.payoutInfo,
        ...payoutInfo,
      };
    }
    const canUpdateRating = userId !== requestingUserId;
    if (rating !== undefined && canUpdateRating) {
      profile.rating = rating;
    }

    // Handle KYC status and rejection reason (admin only)
    const canUpdateKyc = userId !== requestingUserId;
    if (kycStatus !== undefined && canUpdateKyc) {
      profile.kycStatus = kycStatus;

      // Save rejection reason if status is rejected
      if (kycStatus === "rejected" && rejectionReason) {
        profile.rejectionReason = rejectionReason;
      } else if (kycStatus !== "rejected") {
        // Clear rejection reason if status is not rejected
        profile.rejectionReason = "";
      }
    }

    await profile.save();
    await profile.populate("userId", "name email status");
    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};

export const listTeacherProfiles = async (req, res, next) => {
  try {
    const { status, kycStatus, search } = req.query;
    const query = {};
    if (kycStatus) {
      query.kycStatus = kycStatus;
    }
    let profiles = await TeacherProfile.find(query)
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
    const profilesData = profiles.map(profile => {
      const profileObj = profile.toObject();
      profileObj.bio = getLanguageValue(profileObj.bio);
      profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
      return profileObj;
    });
    res.json({ profiles: profilesData, count: profilesData.length });
  } catch (err) {
    next(err);
  }
};

export const updateKycStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { kycStatus, kycDocuments, rejectionReason } = req.body;
    if (!["pending", "verified", "rejected"].includes(kycStatus)) {
      return res.status(400).json({ message: "Invalid KYC status" });
    }
    const profile = await TeacherProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }
    profile.kycStatus = kycStatus;

    // Save rejection reason if status is rejected
    if (kycStatus === "rejected" && rejectionReason) {
      profile.rejectionReason = rejectionReason;
    } else if (kycStatus !== "rejected") {
      // Clear rejection reason if status is not rejected
      profile.rejectionReason = "";
    }

    if (kycDocuments) {
      profile.kycDocuments = {
        ...profile.kycDocuments,
        ...kycDocuments,
      };
    }
    await profile.save();
    await profile.populate("userId", "name email status");
    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};

export const updateEarnings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount, operation = "add" } = req.body;
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const profile = await TeacherProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }
    if (operation === "add") {
      profile.totalEarnings += amount;
      profile.pendingPayout += amount;
    } else if (operation === "set") {
      profile.totalEarnings = amount;
    } else {
      return res.status(400).json({ message: "Invalid operation" });
    }
    await profile.save();
    await profile.populate("userId", "name email status");
    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};

export const processPayout = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const profile = await TeacherProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }
    if (amount > profile.pendingPayout) {
      return res.status(400).json({ message: "Amount exceeds pending payout" });
    }
    profile.pendingPayout -= amount;
    profile.paidAmount += amount;
    await profile.save();
    await profile.populate("userId", "name email status");
    const profileObj = profile.toObject();
    profileObj.bio = getLanguageValue(profileObj.bio);
    profileObj.aboutUs = getLanguageValue(profileObj.aboutUs);
    res.json({ profile: profileObj });
  } catch (err) {
    next(err);
  }
};
