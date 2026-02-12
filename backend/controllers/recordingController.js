import Booking from "../models/bookingModel.js";

export const getBookingRecording = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isStudent = booking.studentId.toString() === userId;
    const isTeacher = booking.teacherId.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isStudent && !isTeacher && !isAdmin) {
      return res.status(403).json({
        error: "Access denied: You don't have permission to view this recording",
      });
    }

    if (!booking.recording || !booking.recording.url) {
      return res.status(404).json({
        error: "Recording not available",
        status: booking.recording?.status || "pending",
        message: getRecordingStatusMessage(booking.recording?.status),
      });
    }

    return res.status(200).json({
      recording: {
        url: booking.recording.url,
        duration: booking.recording.duration,
        status: booking.recording.status,
        uploadedAt: booking.recording.uploadedAt,
        provider: booking.recording.provider,
      },
      access: {
        canView: true,
        canDownload: isAdmin,
        role: isStudent ? "student" : isTeacher ? "teacher" : "admin",
      },
      booking: {
        id: booking._id,
        sessionDate: booking.sessionDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecordingStatusMessage = (status) => {
  const messages = {
    pending: "Recording is being processed. Please check back in 10-15 minutes.",
    processing: "Recording is currently being uploaded. Please check back soon.",
    ready: "Recording is ready to view.",
    failed: "Recording processing failed. Please contact support.",
    not_available: "Recording is not available for this session.",
  };
  return messages[status] || "Recording status unknown.";
};

export const listAllRecordings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) {
      filter["recording.status"] = status;
    }

    const bookings = await Booking.find(filter)
      .select("studentId teacherId sessionDate recording")
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .sort({ "recording.uploadedAt": -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      recordings: bookings.map((b) => ({
        bookingId: b._id,
        student: b.studentId,
        teacher: b.teacherId,
        sessionDate: b.sessionDate,
        recording: b.recording,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecordingStats = async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: "$recording.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSize = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBytes: { $sum: "$recording.zoomMetadata.fileSize" },
          totalDuration: { $sum: "$recording.duration" },
        },
      },
    ]);

    return res.status(200).json({
      statusBreakdown: stats.reduce((acc, item) => {
        acc[item._id || "unknown"] = item.count;
        return acc;
      }, {}),
      totals: {
        totalSizeGB: totalSize[0]?.totalBytes
          ? (totalSize[0].totalBytes / 1024 / 1024 / 1024).toFixed(2)
          : 0,
        totalHours: totalSize[0]?.totalDuration
          ? (totalSize[0].totalDuration / 3600).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
