# Student Profile Schema - Updated for LMS Booking System

## Overview

The student profile system is designed for a **lesson-booking platform**.

- Personal details (name, email) are sourced from the base `User` model to avoid duplication.
- Location details (Country, State, City) have been added.
- Learning progress is calculated based on 1-to-1 lesson bookings.

## Schema Structure

### Core & Location Information

```javascript
{
  userId: ObjectId (ref: User) - Required, unique
  photo: String - Profile picture URL
  phone: String - Contact number
  country: String - NEW: Student's country
  state: String - NEW: Student's state
  city: String - NEW: Student's city
  timezone: String - Student's timezone (default: "UTC")
}
```

_Note: Name, Username, and Email come from the populated `userId` field._

### Social Links

```javascript
{
  socialLinks: {
    facebook: String;
    twitter: String;
    linkedin: String;
    website: String;
    github: String;
  }
}
```

### Learning Progress (Auto-calculated from Bookings)

Since this is a booking-based system (not course enrollment), we track lessons booked vs completed.

```javascript
{
  progress: {
    totalCourses: Number; // Count of unique courses student has booked lessons for
    totalHoursSpent: Number; // Total hours of completed lessons
    totalLessonsBooked: Number; // Total paid bookings (excluding cancelled)
    totalLessonsCompleted: Number; // Total lessons marked 'completed'
  }
}
```

## Removed Fields

The following fields were removed as they are not needed or are duplicates:

- ❌ `firstName`, `lastName`, `username`, `displayName` (Use `userId.name` / `userId.email`)
- ❌ `coverPhoto`
- ❌ `skill`, `occupation`, `bio`
- ❌ `progress.completedCourses`, `progress.inProgressCourses`

## API Response Example

```json
{
  "profile": {
    "_id": "698052152bd587c9f4ed1737",
    "userId": {
        "_id": "6971e3e658edcd34deb291f8",
        "name": "OVS Innovation",
        "email": "ovs.developer26@gmail.com",
        "status": "active"
    },
    "photo": "https://...",
    "phone": "+1234567890",
    "country": "India",
    "state": "Start",
    "city": "City",
    "timezone": "Asia/Calcutta",
    "socialLinks": { ... },
    "progress": {
        "totalCourses": 1,
        "totalHoursSpent": 0.83,
        "totalLessonsBooked": 5,
        "totalLessonsCompleted": 1
    }
  },
  "courseProgress": [
    {
      "courseId": "...",
      "courseName": "Yoga Class",
      "totalBooked": 5,
      "completed": 1,
      "scheduled": 4,
      "totalHours": 0.83,
      "progressPercentage": 20
    }
  ]
}
```

## API Endpoints

### Get Profile

`GET /api/student-profiles/:userId`

### Update Profile

`PATCH /api/student-profiles/:userId`
Body:

```json
{
  "phone": "+1234567890",
  "country": "India",
  "state": "Maharashtra",
  "city": "Pune",
  "socialLinks": {
    "linkedin": "https://linkedin.com/..."
  }
}
```

### Search/Filter

`GET /api/student-profiles?search=pune`
Searches in: Name, Email (from User), Country, State, City.
