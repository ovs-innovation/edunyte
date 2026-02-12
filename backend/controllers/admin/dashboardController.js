import User from "../../models/userModel.js";
import Booking from "../../models/bookingModel.js";
import Course from "../../models/courseModel.js";
import TeacherCourse from "../../models/teacherCourseModel.js";
import { getLanguageValue } from "../../utils/languageHelper.js";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { dateRange = '30d', courseId = 'all', teacherId = 'all' } = req.query;

    // Calculate date filter
    let startDate = new Date();
    switch (dateRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Build booking filter
    const bookingFilter = {
      createdAt: { $gte: startDate }
    };

    if (courseId !== 'all') {
      bookingFilter.courseId = courseId;
    }

    if (teacherId !== 'all') {
      bookingFilter.teacherId = teacherId;
    }

    // Get total users count
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });

    // Get user distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const userDistribution = usersByRole.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1) + 's',
      value: item.count,
    }));

    // Get total courses (with optional filter)
    let courseFilter = { status: "active" };
    if (courseId !== 'all') {
      courseFilter._id = courseId;
    }
    const totalCourses = await Course.countDocuments(courseFilter);

    // Get total enrollments with filters
    const totalEnrollments = await Booking.countDocuments(bookingFilter);

    // Get total revenue from completed bookings with filters
    const revenueFilter = { ...bookingFilter, paymentStatus: "paid" };
    const revenueData = await Booking.aggregate([
      { $match: revenueFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricingSnapshot.studentPaid.amount" },
          totalPlatformFee: { $sum: "$pricingSnapshot.platformFeeUSD" },
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const totalPlatformFee = revenueData.length > 0 ? revenueData[0].totalPlatformFee : 0;

    // Get monthly enrollment trends based on date range
    const monthsToShow = dateRange === '1y' ? 12 : dateRange === '90d' ? 3 : dateRange === '30d' ? 7 : 7;
    const trendsStartDate = new Date();
    trendsStartDate.setMonth(trendsStartDate.getMonth() - (monthsToShow - 1));

    const trendFilter = {
      createdAt: { $gte: trendsStartDate }
    };
    if (courseId !== 'all') trendFilter.courseId = courseId;
    if (teacherId !== 'all') trendFilter.teacherId = teacherId;

    const enrollmentTrends = await Booking.aggregate([
      { $match: trendFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          enrollments: { $sum: 1 },
          revenue: { $sum: "$pricingSnapshot.studentPaid.amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const enrollmentData = enrollmentTrends.map(item => ({
      month: monthNames[item._id.month - 1],
      enrollments: item.enrollments,
      revenue: Math.round(item.revenue)
    }));

    // Get top performing courses with filters
    const coursePerformanceFilter = { paymentStatus: "paid" };
    if (courseId !== 'all') coursePerformanceFilter.courseId = courseId;
    if (teacherId !== 'all') coursePerformanceFilter.teacherId = teacherId;
    if (dateRange !== 'all') coursePerformanceFilter.createdAt = { $gte: startDate };

    const topCourses = await Booking.aggregate([
      { $match: coursePerformanceFilter },
      {
        $group: {
          _id: "$courseId",
          students: { $sum: 1 },
        }
      },
      { $sort: { students: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseData"
        }
      },
      { $unwind: "$courseData" }
    ]);

    const coursePerformance = topCourses.map(item => ({
      name: getLanguageValue(item.courseData.name) || 'Unknown Course',
      students: item.students,
      completion: 0,
      rating: 0,
    }));

    // Calculate previous period stats for changes
    const currentPeriodDays = dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : 30;
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - currentPeriodDays);

    const previousFilter = {
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    };
    if (courseId !== 'all') previousFilter.courseId = courseId;
    if (teacherId !== 'all') previousFilter.teacherId = teacherId;

    const previousPeriodEnrollments = await Booking.countDocuments(previousFilter);

    const enrollmentChange = previousPeriodEnrollments > 0
      ? ((totalEnrollments - previousPeriodEnrollments) / previousPeriodEnrollments * 100).toFixed(1)
      : totalEnrollments > 0 ? 100 : 0;

    const previousRevenueFilter = { ...previousFilter, paymentStatus: "paid" };
    const previousPeriodRevenue = await Booking.aggregate([
      { $match: previousRevenueFilter },
      { $group: { _id: null, total: { $sum: "$pricingSnapshot.studentPaid.amount" } } }
    ]);

    const previousRev = previousPeriodRevenue.length > 0 ? previousPeriodRevenue[0].total : 0;

    const revenueChange = previousRev > 0
      ? ((totalRevenue - previousRev) / previousRev * 100).toFixed(1)
      : totalRevenue > 0 ? 100 : 0;

    res.json({
      stats: {
        activeUsers,
        totalUsers,
        totalRevenue: Math.round(totalRevenue),
        totalPlatformFee: Math.round(totalPlatformFee),
        totalCourses,
        totalEnrollments,
        enrollmentChange: parseFloat(enrollmentChange),
        revenueChange: parseFloat(revenueChange),
      },
      enrollmentData,
      coursePerformance,
      userDistribution,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    next(err);
  }
};

