import cron from "node-cron";
import Booking from "../models/bookingModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import {
  sendSessionReminderEmailToStudent,
  sendSessionReminderEmailToInstructor,
} from "../utils/emailService.js";
import { toUTCDate } from "../utils/timezoneHelper.js";

let reminderCronJob = null;
let isProcessing = false;

/**
 * Extracts a readable course name from a string or localized object
 */
const getCourseTitle = (course) => {
  if (!course) return "Live Class Session";
  if (typeof course === "string") return course;
  if (typeof course.name === "string") return course.name;
  if (course.name && typeof course.name === "object") {
    return course.name.en || course.name.es || Object.values(course.name)[0] || "Live Class Session";
  }
  if (typeof course.title === "string") return course.title;
  return "Live Class Session";
};

/**
 * Derives the exact UTC Date when a session is scheduled to start
 */
const getSessionStartUTC = (booking) => {
  if (booking.lesson?.scheduledAt) {
    const d = new Date(booking.lesson.scheduledAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (booking.sessionDate && booking.startTime) {
    try {
      const d = toUTCDate(booking.sessionDate, booking.startTime, booking.timezone || "UTC");
      if (d && !isNaN(d.getTime())) return d;
    } catch (e) {
      // Fallback
    }
  }
  if (booking.sessionDate) {
    const d = new Date(booking.sessionDate);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

/**
 * Checks for upcoming sessions starting in 10-15 minutes and sends reminders
 */
export const checkAndSendSessionReminders = async () => {
  if (isProcessing) {
    return;
  }
  isProcessing = true;

  try {
    const now = new Date();

    // -------------------------------------------------------------
    // 1. Process 1-on-1 and Group Bookings
    // -------------------------------------------------------------
    const pendingBookings = await Booking.find({
      status: "scheduled",
      reminderSent: { $ne: true },
    })
      .populate("studentId", "name email timezone")
      .populate("teacherId", "name email timezone")
      .populate("courseId", "name title description");

    for (const booking of pendingBookings) {
      try {
        const sessionStartTime = getSessionStartUTC(booking);
        if (!sessionStartTime) continue;

        const diffMs = sessionStartTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Mark very old past bookings as reminderSent so they aren't repeatedly scanned
        if (diffMinutes < -60) {
          booking.reminderSent = true;
          booking.reminderSentAt = new Date();
          await booking.save();
          continue;
        }

        // Target window: Session starts within the next 15 minutes (diffMinutes between -2 and 16)
        if (diffMinutes >= -2 && diffMinutes <= 16) {
          const student = booking.studentId;
          const teacher = booking.teacherId;
          const courseName = getCourseTitle(booking.courseId);
          const duration = booking.duration || booking.lesson?.duration || 50;
          const timezone = booking.timezone || student?.timezone || teacher?.timezone || "Asia/Kolkata";

          const studentMeetingUrl =
            booking.meeting?.joinUrlStudent ||
            booking.meetingUrl ||
            "";

          const teacherMeetingUrl =
            booking.meeting?.joinUrlTeacher ||
            booking.meetingUrl ||
            "";

          console.log(
            `🔔 [REMINDER] Triggering 15-min reminder for booking ${booking._id}: ` +
            `Course="${courseName}", starts in ~${Math.round(diffMinutes)} mins.`
          );

          // 1. Send Email to Student
          if (student?.email) {
            await sendSessionReminderEmailToStudent({
              studentEmail: student.email,
              studentName: student.name || "Student",
              teacherName: teacher?.name || "Instructor",
              courseName,
              sessionStartTime,
              duration,
              meetingUrl: studentMeetingUrl,
              timezone,
            });

            // In-app Notification for student
            await Notification.create({
              userId: student._id,
              title: "Class Starting Soon!",
              message: `Your class for "${courseName}" with ${teacher?.name || "your instructor"} starts in ~15 minutes.`,
              type: "session_reminder",
              data: {
                bookingId: booking._id,
                courseId: booking.courseId?._id || booking.courseId,
                meetingUrl: studentMeetingUrl,
                scheduledAt: sessionStartTime,
              },
            }).catch((err) => console.error("Error creating student notification:", err.message));
          }

          // 2. Send Email to Instructor
          if (teacher?.email) {
            await sendSessionReminderEmailToInstructor({
              teacherEmail: teacher.email,
              teacherName: teacher.name || "Instructor",
              studentName: student?.name || "Student",
              courseName,
              sessionStartTime,
              duration,
              meetingUrl: teacherMeetingUrl,
              timezone,
            });

            // In-app Notification for teacher
            await Notification.create({
              userId: teacher._id,
              title: "Teaching Session Starting Soon!",
              message: `Your session for "${courseName}" with ${student?.name || "your student"} starts in ~15 minutes.`,
              type: "session_reminder",
              data: {
                bookingId: booking._id,
                courseId: booking.courseId?._id || booking.courseId,
                meetingUrl: teacherMeetingUrl,
                scheduledAt: sessionStartTime,
              },
            }).catch((err) => console.error("Error creating teacher notification:", err.message));
          }

          // 3. Mark booking as reminded so duplicate emails are never sent
          booking.reminderSent = true;
          booking.reminderSentAt = new Date();
          await booking.save();
        }
      } catch (itemErr) {
        console.error(`Error processing reminder for booking ${booking._id}:`, itemErr.message);
      }
    }

    // -------------------------------------------------------------
    // 2. Process Course Live Lectures (Lecture model)
    // -------------------------------------------------------------
    const pendingLectures = await Lecture.find({
      type: "live",
      "liveMeeting.status": "scheduled",
      "liveMeeting.reminderSent": { $ne: true },
      "liveMeeting.scheduledAt": { $exists: true, $ne: null },
    })
      .populate("courseId", "name title description")
      .populate("createdBy", "name email timezone");

    for (const lecture of pendingLectures) {
      try {
        const scheduledAt = lecture.liveMeeting?.scheduledAt;
        if (!scheduledAt) continue;

        const diffMinutes = (new Date(scheduledAt).getTime() - now.getTime()) / (1000 * 60);

        if (diffMinutes < -60) {
          lecture.liveMeeting.reminderSent = true;
          lecture.liveMeeting.reminderSentAt = new Date();
          await lecture.save();
          continue;
        }

        if (diffMinutes >= -2 && diffMinutes <= 16) {
          const courseName = getCourseTitle(lecture.courseId);
          const teacher = lecture.createdBy;
          const meetingUrl = lecture.liveMeeting?.meetingUrl || "";
          const duration = lecture.liveMeeting?.duration || 60;

          // Find enrolled students for this course
          const enrolledStudentIds = await Booking.find({
            courseId: lecture.courseId?._id || lecture.courseId,
            status: { $in: ["scheduled", "completed"] },
          }).distinct("studentId");

          const enrolledStudents = await User.find({ _id: { $in: enrolledStudentIds } }, "name email timezone");

          console.log(
            `🔔 [REMINDER] Triggering live lecture reminder for lecture "${lecture.title?.en || lecture.title}" ` +
            `in course "${courseName}" (${enrolledStudents.length} students).`
          );

          // 1. Notify Instructor
          if (teacher?.email) {
            await sendSessionReminderEmailToInstructor({
              teacherEmail: teacher.email,
              teacherName: teacher.name || "Instructor",
              studentName: `${enrolledStudents.length} Enrolled Student(s)`,
              courseName,
              sessionStartTime: scheduledAt,
              duration,
              meetingUrl,
              timezone: teacher.timezone || "Asia/Kolkata",
            });

            await Notification.create({
              userId: teacher._id,
              title: "Live Lecture Starting Soon!",
              message: `Your live lecture for "${courseName}" starts in ~15 minutes.`,
              type: "session_reminder",
              data: {
                courseId: lecture.courseId?._id || lecture.courseId,
                meetingUrl,
                scheduledAt,
              },
            }).catch((err) => console.error("Error creating lecture teacher notification:", err.message));
          }

          // 2. Notify Enrolled Students
          for (const student of enrolledStudents) {
            if (student.email) {
              await sendSessionReminderEmailToStudent({
                studentEmail: student.email,
                studentName: student.name || "Student",
                teacherName: teacher?.name || "Instructor",
                courseName,
                sessionStartTime: scheduledAt,
                duration,
                meetingUrl,
                timezone: student.timezone || "Asia/Kolkata",
              });

              await Notification.create({
                userId: student._id,
                title: "Live Lecture Starting Soon!",
                message: `Live lecture for "${courseName}" starts in ~15 minutes.`,
                type: "session_reminder",
                data: {
                  courseId: lecture.courseId?._id || lecture.courseId,
                  meetingUrl,
                  scheduledAt,
                },
              }).catch((err) => console.error("Error creating student notification:", err.message));
            }
          }

          // 3. Mark lecture as reminded
          lecture.liveMeeting.reminderSent = true;
          lecture.liveMeeting.reminderSentAt = new Date();
          await lecture.save();
        }
      } catch (lectureErr) {
        console.error(`Error processing reminder for lecture ${lecture._id}:`, lectureErr.message);
      }
    }
  } catch (error) {
    console.error("❌ [CRON] Error in checkAndSendSessionReminders:", error.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Starts the session reminder cron job
 * Runs every 1 minute to check for sessions starting in 10-15 minutes
 */
export const startSessionReminderJob = () => {
  if (reminderCronJob) {
    console.log("⚠️  Session reminder job is already running");
    return;
  }

  // Schedule to run every minute
  reminderCronJob = cron.schedule("* * * * *", async () => {
    await checkAndSendSessionReminders();
  });

  console.log("✅ Session reminder cron job started (runs every 1 minute for 10-15 min notices)");
};

export const stopSessionReminderJob = () => {
  if (reminderCronJob) {
    reminderCronJob.stop();
    reminderCronJob = null;
    console.log("Session reminder job stopped");
  }
};
