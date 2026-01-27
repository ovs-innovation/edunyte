import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Category from "../models/categoryModel.js";
import Language from "../models/languageModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import TeacherProfile from "../models/teacherProfileModel.js";
import Availability from "../models/availabilityModel.js";
import Booking from "../models/bookingModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const migrateData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("Error: MONGO_URI is not defined in environment variables.");
      console.error("Please make sure you have a .env file in the backend directory with MONGO_URI set.");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    console.log("Migrating Courses...");
    const courses = await Course.find({});
    let migratedCourses = 0;
    for (const course of courses) {
      try {
        let updated = false;
        if (typeof course.name === "string") {
          course.name = { en: course.name };
          updated = true;
        }
        if (typeof course.description === "string") {
          course.description = { en: course.description };
          updated = true;
        }
        if (typeof course.slug === "string" && course.slug) {
          course.slug = { en: course.slug };
          updated = true;
        }
        if (updated) {
          await course.save();
          migratedCourses++;
        }
      } catch (err) {
        console.warn(`Skipping course ${course._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedCourses} courses`);

    console.log("Migrating Categories...");
    const categories = await Category.find({});
    let migratedCategories = 0;
    for (const category of categories) {
      try {
        let updated = false;
        if (typeof category.name === "string") {
          category.name = { en: category.name };
          updated = true;
        }
        if (typeof category.description === "string") {
          category.description = { en: category.description };
          updated = true;
        }
        if (typeof category.slug === "string" && category.slug) {
          category.slug = { en: category.slug };
          updated = true;
        }
        if (updated) {
          await category.save();
          migratedCategories++;
        }
      } catch (err) {
        console.warn(`Skipping category ${category._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedCategories} categories`);

    console.log("Migrating Languages...");
    const languages = await Language.find({});
    let migratedLanguages = 0;
    for (const language of languages) {
      try {
        let updated = false;
        if (typeof language.name === "string") {
          language.name = { en: language.name };
          updated = true;
        }
        if (typeof language.nativeName === "string") {
          language.nativeName = { en: language.nativeName };
          updated = true;
        }
        if (updated) {
          await language.save();
          migratedLanguages++;
        }
      } catch (err) {
        console.warn(`Skipping language ${language._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedLanguages} languages`);

    console.log("Migrating TeacherCourses...");
    const teacherCourses = await TeacherCourse.find({});
    let migratedTeacherCourses = 0;
    for (const tc of teacherCourses) {
      try {
        let updated = false;
        if (typeof tc.experience === "string") {
          tc.experience = { en: tc.experience };
          updated = true;
        }
        if (typeof tc.bio === "string") {
          tc.bio = { en: tc.bio };
          updated = true;
        }
        if (typeof tc.aboutCourse === "string") {
          tc.aboutCourse = { en: tc.aboutCourse };
          updated = true;
        }
        if (!tc.currency || tc.currency === "USD") {
          tc.currency = "INR";
          updated = true;
        }
        if (updated) {
          await tc.save();
          migratedTeacherCourses++;
        }
      } catch (err) {
        console.warn(`Skipping teacher course ${tc._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedTeacherCourses} teacher courses`);

    console.log("Migrating TeacherProfiles...");
    const teacherProfiles = await TeacherProfile.find({});
    let migratedTeacherProfiles = 0;
    for (const profile of teacherProfiles) {
      try {
        let updated = false;
        if (typeof profile.bio === "string") {
          profile.bio = { en: profile.bio };
          updated = true;
        }
        if (typeof profile.aboutUs === "string") {
          profile.aboutUs = { en: profile.aboutUs };
          updated = true;
        }
        if (updated) {
          await profile.save();
          migratedTeacherProfiles++;
        }
      } catch (err) {
        console.warn(`Skipping teacher profile ${profile._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedTeacherProfiles} teacher profiles`);

    console.log("Migrating Availabilities...");
    const availabilities = await Availability.find({});
    let migratedAvailabilities = 0;
    for (const availability of availabilities) {
      try {
        if (!availability.currency || availability.currency === "USD") {
          availability.currency = "INR";
          await availability.save();
          migratedAvailabilities++;
        }
      } catch (err) {
        console.warn(`Skipping invalid availability ${availability._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedAvailabilities} availabilities`);

    console.log("Migrating Bookings...");
    const bookings = await Booking.find({});
    let migratedBookings = 0;
    for (const booking of bookings) {
      try {
        if (!booking.currency || booking.currency === "USD") {
          booking.currency = "INR";
          await booking.save();
          migratedBookings++;
        }
      } catch (err) {
        console.warn(`Skipping booking ${booking._id}: ${err.message}`);
      }
    }
    console.log(`Migrated ${migratedBookings} bookings`);

    console.log("Migration completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrateData();


