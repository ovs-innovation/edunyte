# Platform Fee Implementation - Testing Guide

## Overview

The platform fee percentage can be set in two ways:

1. **Global Default**: Set in Admin Settings page (default: 4%)
2. **Per-Course Custom**: Set in Teacher Course Request Approval (TCRA) page for specific teacher courses

## Priority Logic

When calculating checkout amounts, the system uses:

1. **First Priority**: Custom platform fee set for the specific teacher course (if exists)
2. **Fallback**: Global platform fee percentage from settings

## Testing Scenarios

### Scenario 1: Global Platform Fee

**Setup:**

- Admin sets global platform fee to 5% in Settings page
- No custom fee is set for any teacher course

**Expected Result:**

- All bookings use 5% platform fee
- TCRA page shows 5% for all teacher courses
- Student checkout shows 5% fee

### Scenario 2: Custom Platform Fee per Teacher Course

**Setup:**

- Global platform fee is 5% in Settings
- Admin sets custom fee of 10% for Teacher A's Yoga course in TCRA
- Teacher B's Yoga course has no custom fee

**Expected Result:**

- Teacher A's Yoga course: 10% platform fee (custom)
  - Shows "Custom" badge in TCRA
  - Student checkout uses 10%
- Teacher B's Yoga course: 5% platform fee (global)
  - No "Custom" badge in TCRA
  - Student checkout uses 5%

### Scenario 3: Update Global Fee

**Setup:**

- Global fee is 4%
- Some courses have custom fees, some don't
- Admin updates global fee to 6%

**Expected Result:**

- Courses with custom fees: Still use their custom percentage
- Courses without custom fees: Now use 6%
- All calculations update immediately

### Scenario 4: Update Custom Fee

**Setup:**

- Teacher course has 8% custom fee
- Admin changes it to 12% in TCRA

**Expected Result:**

- TCRA immediately shows 12%
- New bookings use 12%
- Price breakdown updates in TCRA table

### Scenario 5: Reset to Global

**Setup:**

- Teacher course has 10% custom fee
- Global fee is 5%
- Admin clicks "Use Global" in custom fee dialog

**Expected Result:**

- Custom fee is removed
- Course now uses 5% (global)
- "Custom" badge disappears

## Key Files Modified

### Backend

1. **pricingService.js**:
   - Uses `teacherCourse.customPlatformFeePercent` if set
   - Falls back to `settings.platformFeePercent`

2. **teacherCourseModel.js**:
   - Added `customPlatformFeePercent` field (0-100, optional)

3. **teacherCourseController.js**:
   - Added `updateTeacherCourse` function for admin updates

4. **routes/admin/teacherCourseRoutes.js**:
   - Added PATCH `/admin/teacher-course/:id` route

### Frontend (Admin)

1. **api.ts**:
   - Added `update` method to `TeacherCoursesAPI`
   - Added `platformFeePercent` to `ApiSettings`

2. **SettingsPage.tsx**:
   - Financial settings card with platform fee input

3. **TeacherApprovalPage.tsx**:
   - Platform fee info card (shows global fee)
   - Custom fee edit button per course
   - Custom fee dialog
   - Pricing breakdown with custom/global fee

## Verification Checklist

- [ ] Global platform fee can be set in Settings (0-100%)
- [ ] Custom platform fee can be set per teacher course in TCRA
- [ ] "Custom" badge appears when custom fee is set
- [ ] Price calculations use correct fee (custom > global)
- [ ] Student checkout uses correct platform fee
- [ ] Edit button works on each course in TCRA
- [ ] "Use Global" button resets to global fee
- [ ] Platform fee info card shows current global fee
- [ ] Booking pricing snapshot includes correct fee percentage
- [ ] Multiple students pricing includes platform fee

## Database Fields

### Settings Collection

```javascript
{
  platformFeePercent: 4; // Global default, 0-100
}
```

### TeacherCourse Collection

```javascript
{
  customPlatformFeePercent: 10; // Optional, 0-100
  // If undefined, uses global setting
}
```

## API Endpoints

### Get Settings

```
GET /api/settings
Response: { settings: { platformFeePercent: 4, ... } }
```

### Update Settings

```
PATCH /api/settings
Body: { platformFeePercent: 5 }
```

### Update Teacher Course

```
PATCH /api/admin/teacher-course/:id
Body: { customPlatformFeePercent: 10 }
Permission: settings.edit
```

## Pricing Calculation Flow

1. Student selects teacher course and time slot
2. Backend calls `resolveCheckoutContext()` → fetches teacherCourse
3. Backend calls `calculateCheckoutAmounts({ teacherCourse, ... })`
4. Pricing service checks:
   - Is `teacherCourse.customPlatformFeePercent` set? Use it.
   - Otherwise, use `settings.platformFeePercent`
5. Calculate: platformFee = lessonAmount × platformFeePercent / 100
6. Return total = lessonAmount + platformFee

## Notes

- Custom fee is stored in the TeacherCourse document (not in Booking)
- Each booking snapshot includes the fee percentage used at time of booking
- Changing fees affects only NEW bookings (existing bookings are immutable)
- Platform fee applies to total lesson amount (after student count multiplication)
