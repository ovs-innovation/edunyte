import StudentProfile from "../models/studentProfileModel.js";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js";
import TeacherProfile from "../models/teacherProfileModel.js";
import Course from "../models/courseModel.js";
import { getLanguageValue } from "../utils/languageHelper.js";

// wrapper to get own profile
export const getMyProfile = async (req, res, next) => {
  req.params.userId = req.user.id;
  return getStudentProfile(req, res, next);
};

// wrapper to update own profile
export const updateMyProfile = async (req, res, next) => {
  req.params.userId = req.user.id;
  return updateStudentProfile(req, res, next);
};

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
    
    // Calculate progress from bookings
    const progressData = await calculateStudentProgress(userId);
    profile = await StudentProfile.findOne({ userId }).populate("userId", "name email status");
    
    res.json({ 
      profile,
      courseProgress: progressData.courseProgress 
    });
  } catch (err) {
    next(err);
  }
};

export const listStudentProfiles = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    // If user is a teacher, filter by their students (who have booked them)
    if (req.user.role === 'teacher') {
      const bookings = await Booking.find({ teacherId: req.user.id }).distinct('studentId');
      query.userId = { $in: bookings };
    }

    let profiles = await StudentProfile.find(query)
      .populate("userId", "name email status")
      .sort({ createdAt: -1 });
    
    // Calculate progress for fetched students
    for (const profile of profiles) {
      if (profile.userId && profile.userId._id) {
        await calculateStudentProgress(profile.userId._id);
      }
    }
    
    // Reload profiles with updated progress
    profiles = await StudentProfile.find(query)
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
          p.userId?.email?.toLowerCase().includes(searchLower) ||
          p.country?.toLowerCase().includes(searchLower) ||
          p.state?.toLowerCase().includes(searchLower) ||
          p.city?.toLowerCase().includes(searchLower)
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
    
    const { 
      photo, 
      phone, 
      timezone,
      country,
      state,
      city,
      socialLinks
    } = req.body;
    
    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentProfile.create({ userId });
    }
    
    // Update fields
    if (photo !== undefined) profile.photo = photo;
    if (phone !== undefined) profile.phone = phone;
    if (timezone !== undefined) profile.timezone = timezone;
    if (country !== undefined) profile.country = country;
    if (state !== undefined) profile.state = state;
    if (city !== undefined) profile.city = city;
    
    // Update social links
    if (socialLinks) {
      if (socialLinks.facebook !== undefined) profile.socialLinks.facebook = socialLinks.facebook;
      if (socialLinks.twitter !== undefined) profile.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.linkedin !== undefined) profile.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.website !== undefined) profile.socialLinks.website = socialLinks.website;
      if (socialLinks.github !== undefined) profile.socialLinks.github = socialLinks.github;
    }
    
    await profile.save();
    await profile.populate("userId", "name email status");
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

// Helper function to calculate student progress from bookings
export const calculateStudentProgress = async (userId) => {
  try {
    const bookings = await Booking.find({ 
      studentId: userId,
      paymentStatus: 'paid'
    }).populate('courseId');
    
    // Calculate total lessons booked (excluding cancelled)
    const totalLessonsBooked = bookings.filter(b => b.status !== 'cancelled').length;
    
    // Calculate completed lessons
    const completedLessons = bookings.filter(b => b.status === 'completed').length;
    
    // Calculate total hours spent (only completed lessons)
    const totalMinutes = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.duration || 0), 0);
    const totalHoursSpent = Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimals
    
    // Get unique courses and calculate per-course progress
    const courseProgressMap = new Map();
    
    bookings.forEach(booking => {
      if (booking.courseId && booking.status !== 'cancelled') {
        const courseId = booking.courseId._id.toString();
        const courseName = booking.courseId.name?.en || 'Unknown Course';
        
        if (!courseProgressMap.has(courseId)) {
          courseProgressMap.set(courseId, {
            courseId: courseId,
            courseName: courseName,
            totalBooked: 0,
            completed: 0,
            scheduled: 0,
            totalHours: 0,
            progressPercentage: 0
          });
        }
        
        const progress = courseProgressMap.get(courseId);
        progress.totalBooked++;
        
        if (booking.status === 'completed') {
          progress.completed++;
          progress.totalHours += (booking.duration || 0) / 60;
        } else if (booking.status === 'scheduled') {
          progress.scheduled++;
        }
        
        // Calculate progress percentage (completed / total booked)
        progress.progressPercentage = Math.round((progress.completed / progress.totalBooked) * 100);
        progress.totalHours = Math.round(progress.totalHours * 100) / 100;
      }
    });
    
    const totalCourses = courseProgressMap.size;
    
    // Convert Map to Array for easier frontend consumption
    const courseProgress = Array.from(courseProgressMap.values());
    
    // Update student profile
    await StudentProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          'progress.totalCourses': totalCourses,
          'progress.totalHoursSpent': totalHoursSpent,
          'progress.totalLessonsBooked': totalLessonsBooked,
          'progress.totalLessonsCompleted': completedLessons
        },
        $unset: {
          // Remove old fields if they exist
          'progress.completedCourses': "",
          'progress.inProgressCourses': "",
          'firstName': "",
          'lastName': "",
          'username': "",
          'displayName': "",
          'coverPhoto': "",
          'skill': "",
          'occupation': "",
          'bio': "" 
        }
      },
      { upsert: true, new: true }
    );
    
    return {
      totalCourses,
      totalHoursSpent,
      totalLessonsBooked,
      totalLessonsCompleted: completedLessons,
      courseProgress // Detailed per-course breakdown
    };
  } catch (err) {
    console.error('Error calculating student progress:', err);
    throw err;
  }
};

// API endpoint to manually recalculate progress
export const recalculateProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const progressData = await calculateStudentProgress(userId);
    const profile = await StudentProfile.findOne({ userId }).populate("userId", "name email status");
    res.json({ 
      profile, 
      progress: progressData,
      courseProgress: progressData.courseProgress 
    });
  } catch (err) {
    next(err);
  }
};

// New endpoint to get detailed course progress for a student
export const getCourseProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const progressData = await calculateStudentProgress(userId);
    res.json({ 
      courseProgress: progressData.courseProgress,
      summary: {
        totalCourses: progressData.totalCourses,
        totalLessonsBooked: progressData.totalLessonsBooked,
        totalLessonsCompleted: progressData.totalLessonsCompleted,
        totalHoursSpent: progressData.totalHoursSpent
      }
    });
  } catch (err) {
    next(err);
  }
};
// Toggle Wishlist
export const toggleWishlist = async (req, res, next) => {
  try {
    const { teacherId } = req.body; 
    const studentId = req.user.id;

    if (!teacherId) {
        return res.status(400).json({ message: "Teacher ID is required" });
    }

    let profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) {
      profile = await StudentProfile.create({ userId: studentId });
    }
    
    // Check if teacherId is already in wishlist using string comparison
    const exists = profile.wishlist.some(id => id.toString() === teacherId);
    let isAdded = false;
    
    if (!exists) {
      profile.wishlist.push(teacherId);
      isAdded = true;
    } else {
      // Filter out the teacherId
      profile.wishlist = profile.wishlist.filter(id => id.toString() !== teacherId);
      isAdded = false;
    }
    
    await profile.save();
    
    res.json({ success: true, isAdded, wishlistCount: profile.wishlist.length });
  } catch (err) {
    next(err);
  }
};

// Get Wishlist
export const getWishlist = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const profile = await StudentProfile.findOne({ userId: studentId });
        
        if (!profile || !profile.wishlist || profile.wishlist.length === 0) {
            return res.json({ wishlist: [] });
        }
        
        const wishlistTeachers = await TeacherProfile.find({ userId: { $in: profile.wishlist } })
            .populate('userId', 'name email status role photo')
            .lean();

        // Fetch courses and normalize language fields
        let wishlistCourses = await Course.find({ _id: { $in: profile.wishlist } }).lean();
        wishlistCourses = wishlistCourses.map(course => ({
            ...course,
            name: getLanguageValue(course.name),
            description: getLanguageValue(course.description),
            slug: getLanguageValue(course.slug),
        }));
            
        res.json({ wishlist: [...wishlistTeachers, ...wishlistCourses] });
    } catch (err) {
        next(err);
    }
};
