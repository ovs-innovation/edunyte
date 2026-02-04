# Course Progress in Lesson Booking System

## Understanding Progress in a Booking-Based LMS

Unlike traditional LMS platforms with fixed curricula, your system is a **lesson booking platform** where:

- Students book individual lessons with teachers
- There's no predefined number of lessons per course
- Progress is measured by **lessons completed vs lessons booked**

## How Course Progress Works

### Per-Course Progress Calculation

For each course, the system tracks:

```javascript
{
  courseId: "694e95bb87e3641ae9ea4609",
  courseName: "Yoga Class",
  totalBooked: 4,        // Total lessons booked (excluding cancelled)
  completed: 1,          // Lessons completed
  scheduled: 3,          // Lessons scheduled (not yet completed)
  totalHours: 0.83,      // Hours spent on completed lessons
  progressPercentage: 25 // (completed / totalBooked) * 100
}
```

### Progress Percentage Formula

```
Progress % = (Completed Lessons / Total Booked Lessons) × 100
```

**Example:**

- Student books 4 Yoga lessons
- Completes 1 lesson
- Progress: 1/4 = 25%

### Course Status Categories

1. **Completed Course** (100% progress)
   - All booked lessons are completed
   - `progressPercentage === 100`

2. **In-Progress Course** (1-99% progress)
   - Has at least one completed OR scheduled lesson
   - `progressPercentage > 0 && progressPercentage < 100`

3. **Not Started** (0% progress)
   - Has booked lessons but none completed yet
   - Still counts as "in-progress" because lessons are scheduled

## API Response Examples

### Get Student Profile

```
GET /api/student-profiles/:userId
```

**Response:**

```json
{
  "profile": {
    "progress": {
      "totalCourses": 1,
      "completedCourses": 0,
      "inProgressCourses": 1,
      "totalHoursSpent": 0.83,
      "totalLessonsBooked": 4,
      "totalLessonsCompleted": 1
    },
    "firstName": "OVS",
    "lastName": "Innovation"
    // ... other profile fields
  },
  "courseProgress": [
    {
      "courseId": "694e95bb87e3641ae9ea4609",
      "courseName": "Yoga Class",
      "totalBooked": 4,
      "completed": 1,
      "scheduled": 3,
      "totalHours": 0.83,
      "progressPercentage": 25
    }
  ]
}
```

### Get Detailed Course Progress

```
GET /api/student-profiles/:userId/course-progress
```

**Response:**

```json
{
  "courseProgress": [
    {
      "courseId": "694e95bb87e3641ae9ea4609",
      "courseName": "Yoga Class",
      "totalBooked": 4,
      "completed": 1,
      "scheduled": 3,
      "totalHours": 0.83,
      "progressPercentage": 25
    }
  ],
  "summary": {
    "totalCourses": 1,
    "totalLessonsBooked": 4,
    "totalLessonsCompleted": 1,
    "totalHoursSpent": 0.83
  }
}
```

## Real-World Example

### Scenario: Student Learning Multiple Courses

**Bookings:**

- **Yoga Class**: 4 lessons booked, 1 completed, 3 scheduled
- **Piano Lessons**: 3 lessons booked, 3 completed
- **Spanish**: 2 lessons booked, 1 completed, 1 cancelled

**Calculated Progress:**

```json
{
  "profile": {
    "progress": {
      "totalCourses": 3,
      "completedCourses": 1, // Piano (100%)
      "inProgressCourses": 2, // Yoga (25%), Spanish (100% of valid bookings)
      "totalHoursSpent": 4.17, // Sum of all completed lessons
      "totalLessonsBooked": 8, // 4 + 3 + 1 (excluding cancelled)
      "totalLessonsCompleted": 5 // 1 + 3 + 1
    }
  },
  "courseProgress": [
    {
      "courseId": "...",
      "courseName": "Yoga Class",
      "totalBooked": 4,
      "completed": 1,
      "scheduled": 3,
      "totalHours": 0.83,
      "progressPercentage": 25
    },
    {
      "courseId": "...",
      "courseName": "Piano Lessons",
      "totalBooked": 3,
      "completed": 3,
      "scheduled": 0,
      "totalHours": 2.5,
      "progressPercentage": 100
    },
    {
      "courseId": "...",
      "courseName": "Spanish",
      "totalBooked": 1,
      "completed": 1,
      "scheduled": 0,
      "totalHours": 0.84,
      "progressPercentage": 100
    }
  ]
}
```

## Frontend Display Recommendations

### Dashboard Overview

```
Total Courses: 3
Lessons Completed: 5 / 8 (62.5%)
Hours Spent: 4.17 hours
```

### Course List with Progress Bars

```
📚 Yoga Class
   Progress: ████░░░░░░ 25% (1/4 lessons)
   Time Spent: 0.83 hours

📚 Piano Lessons
   Progress: ██████████ 100% (3/3 lessons) ✓
   Time Spent: 2.5 hours

📚 Spanish
   Progress: ██████████ 100% (1/1 lessons) ✓
   Time Spent: 0.84 hours
```

### Individual Course Page

```
Course: Yoga Class
Progress: 25% Complete

Lessons:
✓ Lesson 1 - Jan 30, 2026 (Completed) - 50 min
⏱ Lesson 2 - Jan 31, 2026 (Scheduled) - 50 min
⏱ Lesson 3 - Feb 1, 2026 (Scheduled) - 25 min
⏱ Lesson 4 - Feb 2, 2026 (Scheduled) - 50 min

Total Time Invested: 0.83 hours
Remaining Lessons: 3
```

## Key Differences from Traditional LMS

| Traditional LMS                                        | Booking-Based LMS (Your System)               |
| ------------------------------------------------------ | --------------------------------------------- |
| Fixed curriculum                                       | Student decides how many lessons to book      |
| Progress = lessons completed / total lessons in course | Progress = lessons completed / lessons booked |
| Course completion = finish all lessons                 | Course completion = finish all booked lessons |
| Predefined course duration                             | Duration based on bookings                    |

## Benefits of This Approach

1. **Flexible Learning**: Students control their learning pace
2. **Realistic Progress**: Shows actual commitment vs completion
3. **Teacher-Student Matching**: Focus on booking quality teachers
4. **Pay-per-Lesson**: Students pay only for what they book
5. **No Pressure**: Can book more lessons anytime to continue learning

## Notes

- Cancelled lessons are excluded from all calculations
- Only paid bookings are counted
- Progress updates automatically when bookings change
- A course can never be "incomplete" - it's complete when all booked lessons are done
- Students can always book more lessons to continue learning
