import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import teacherProfileRoutes from "./routes/teacherProfileRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import adminCourseRoutes from "./routes/admin/courseRoutes.js";
import adminCategoryRoutes from "./routes/admin/categoryRoutes.js";
import adminTeacherCourseRoutes from "./routes/admin/teacherCourseRoutes.js";
import teacherCourseRoutes from "./routes/teacher/teacherCourseRoutes.js";
import teacherAvailabilityRoutes from "./routes/teacher/availabilityRoutes.js";
import teacherBookingRoutes from "./routes/teacher/bookingRoutes.js";
import studentCourseRoutes from "./routes/student/courseRoutes.js";
import studentCategoryRoutes from "./routes/student/categoryRoutes.js";
import publicCourseRoutes from "./routes/student/publicCourseRoutes.js";
import studentBookingRoutes from "./routes/student/bookingRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { ensureDefaultRoles } from "./controllers/roleController.js";



const app = express();
dotenv.config();

connectDB(process.env.MONGO_URI);
ensureDefaultRoles();

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

// Middleware
// Stripe webhook requires the raw body to verify signatures.
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/teacher-profiles", teacherProfileRoutes);
app.use("/api/student-profiles", studentProfileRoutes);
// Course management routes
app.use("/api/admin/courses", adminCourseRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/teacher-course", adminTeacherCourseRoutes);
app.use("/api/teacher", teacherCourseRoutes);
app.use("/api/teacher/availability", teacherAvailabilityRoutes);
app.use("/api/teacher/bookings", teacherBookingRoutes);
app.use("/api/courses", studentCourseRoutes);
app.use("/api/public/categories", studentCategoryRoutes);
app.use("/api/public/courses", publicCourseRoutes);
app.use("/api/bookings", studentBookingRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/payments", paymentRoutes);
app.use(errorHandler);

export default app;
