# Zoom Recording Automation - Setup Guide

## Overview

This system provides **FULLY AUTOMATED** recording handling for Zoom sessions. Recordings are downloaded and stored by the backend WITHOUT any teacher or student involvement.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZOOM CLOUD RECORDING FLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. Session Ends → Zoom processes recording (~5-15 min)
2. Zoom sends webhook: recording.completed
3. Backend downloads recording with OAuth token
4. Backend uploads to Cloudinary/S3
5. Backend updates booking with platform URL
6. Students/Teachers access via platform

┌─────────────────────────────────────────────────────────────────┐
│                         COMPONENTS                              │
└─────────────────────────────────────────────────────────────────┘

✅ Booking Model         - Added recording metadata
✅ Storage Service       - Pluggable (Cloudinary/S3)
✅ Recording Service     - Download & upload logic
✅ Webhook Controller    - Handles Zoom events
✅ Cron Job (Fallback)   - Retries failed recordings
✅ Access Control        - Student/Teacher/Admin permissions
```

## Setup Instructions

### 1. Configure Zoom Webhook

#### Step 1: Go to Zoom Marketplace

- Visit: https://marketplace.zoom.us/
- Sign in with your Zoom account

#### Step 2: Configure Your Server-to-Server OAuth App

- Go to "Develop" → "Build App"
- Select your existing Server-to-Server OAuth app (or create one)

#### Step 3: Add Webhook Subscription

1. Navigate to "Feature" → "Event Subscriptions"
2. Click "Add Event Subscription"
3. Enter:
   - **Subscription Name**: Recording Completed Events
   - **Event notification endpoint URL**:
     ```
     https://yourdomain.com/api/webhooks/zoom
     ```
     (Replace `yourdomain.com` with your backend URL)
4. Click "Validate" - Zoom will send a test request
5. Select Events:
   - Under "Recording", check: `recording.completed`
6. Click "Save"

#### Step 4: Copy Webhook Secret Token

1. After saving, you'll see a "Secret Token"
2. Copy this token
3. Add to your `.env` file:
   ```bash
   ZOOM_WEBHOOK_SECRET=your_webhook_secret_token_here
   ```

### 2. Enable Cloud Recording in Zoom Account

#### Option A: Enable for All Users (Recommended)

1. Go to Zoom Admin Dashboard: https://zoom.us/profile/setting
2. Navigate to "Settings" → "Recording"
3. Enable "Cloud recording"
4. (Optional) Enable "Automatic recording" → "Record in the cloud"

#### Option B: Already Handled in Code

The `zoomService.js` already sets `auto_recording: "cloud"` when creating meetings.

### 3. Update Environment Variables

Add/update these variables in `.env`:

```bash
# Zoom Configuration
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_USER_ID=me
ZOOM_WEBHOOK_SECRET=your_webhook_secret_token

# Recording Storage
RECORDING_STORAGE_PROVIDER=cloudinary  # or 's3'

# Cloudinary (Already configured in your project)
CLOUDINARY_CLOUD_NAME=dhqcwkpzp
CLOUDINARY_API_KEY=918188866222843
CLOUDINARY_API_SECRET=i2NAkPIV4McmjTgULRYV2hltLY8

# AWS S3 (Optional - if using S3)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET_NAME=your-bucket-name
```

### 4. Restart Server

The cron job and webhook routes are automatically initialized on server start.

```bash
npm run dev
```

You should see:

```
✅ Recording cron job started (runs every 10 minutes)
Server running on port http://localhost:8085
```

## Testing

### 1. Test Webhook Endpoint

```bash
curl -X POST http://localhost:8085/api/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "endpoint.url_validation",
    "payload": {
      "plainToken": "test123"
    }
  }'
```

Expected response:

```json
{
  "plainToken": "test123",
  "encryptedToken": "..."
}
```

### 2. Manual Recording Trigger (Admin Only)

After a session ends, you can manually trigger recording processing:

```bash
curl -X POST http://localhost:8085/api/webhooks/zoom/manual-trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "meetingId": "123456789"
  }'
```

### 3. Check Recording Status

Get booking with recording:

```bash
curl -X GET http://localhost:8085/api/bookings/:bookingId/recording \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:

```json
{
  "recording": {
    "url": "https://res.cloudinary.com/.../recording.mp4",
    "duration": 3600,
    "status": "ready",
    "uploadedAt": "2026-02-10T12:00:00Z",
    "provider": "platform"
  },
  "access": {
    "canView": true,
    "canDownload": false,
    "role": "student"
  }
}
```

## How It Works

### Primary Flow: Webhook (Real-time)

```
Session Ends
    ↓
Zoom processes recording (5-15 min)
    ↓
Zoom sends webhook: POST /api/webhooks/zoom
    ↓
Webhook controller validates signature
    ↓
Recording service:
  1. Fetches recording metadata from Zoom API
  2. Downloads MP4 file with OAuth token
  3. Uploads to Cloudinary/S3
  4. Updates booking with platform URL
    ↓
Recording ready! Students/Teachers can access
```

### Fallback Flow: Cron Job (Every 10 minutes)

```
Cron job runs
    ↓
Find bookings with:
  - recording.status = "pending" or "failed"
  - retryCount < 3
  - session ended > 10 min ago
    ↓
For each booking:
  - Retry recording processing
    ↓
Update status to "ready" or "failed"
```

## Access Control

| Role    | View Recording | Download | Access All Recordings |
| ------- | -------------- | -------- | --------------------- |
| Student | ✅ (own)       | ❌       | ❌                    |
| Teacher | ✅ (own)       | ❌       | ❌                    |
| Admin   | ✅             | ✅       | ✅                    |
| Public  | ❌             | ❌       | ❌                    |

## API Endpoints

### Student/Teacher Endpoints

```
GET /api/bookings/:id/recording
Description: Get recording for a booking
Auth: Required (Student/Teacher/Admin)
Response: Recording URL and metadata
```

### Admin Endpoints

```
GET /api/recordings?status=ready&page=1&limit=20
Description: List all recordings
Auth: Required (Admin only)

GET /api/recordings/stats
Description: Get recording statistics
Auth: Required (Admin only)

POST /api/webhooks/zoom/manual-trigger
Description: Manually trigger recording processing
Auth: Required (Admin only)
Body: { "meetingId": "123456789" } or { "bookingId": "..." }
```

### Webhook Endpoint (Public)

```
POST /api/webhooks/zoom
Description: Zoom webhook endpoint
Auth: Signature validation
Body: Zoom webhook payload
```

## Monitoring

### Check Logs

Recording processing logs include:

- 🎬 Processing started
- ✓ Metadata fetched
- ✓ Download complete
- ✓ Upload complete
- ✅ Processing successful
- ✗ Errors (with details)

### Cron Job Logs

Every 10 minutes:

```
⏰ [CRON] Recording retry job triggered
   Time: 2026-02-10T12:00:00Z
   Found 3 recordings to retry
✅ [CRON] Processed 3 recordings
```

## Troubleshooting

### Recording not processing?

1. **Check Zoom webhook configuration**
   - Is the endpoint URL correct?
   - Is the webhook secret correct in `.env`?
   - Check Zoom Marketplace → Your App → Event Subscriptions

2. **Check if recording exists in Zoom**
   - Go to Zoom web portal: https://zoom.us/recording
   - Search for the meeting ID
   - If not found, Zoom might not have recorded (check account settings)

3. **Check server logs**
   - Look for webhook events: `📨 Zoom webhook received`
   - Look for processing logs: `🎬 Processing recording`
   - Look for errors: `✗ Failed to process`

4. **Manually trigger processing**
   - Use the admin endpoint: `POST /api/webhooks/zoom/manual-trigger`
   - Provide meetingId or bookingId

5. **Wait for cron job**
   - Cron runs every 10 minutes
   - Will automatically retry failed recordings

### Common Issues

**Issue**: Webhook not receiving events

- **Fix**: Check if webhook URL is accessible from internet
- **Fix**: Use ngrok for local testing: `ngrok http 8085`

**Issue**: "Invalid signature" error

- **Fix**: Ensure `ZOOM_WEBHOOK_SECRET` matches Zoom Marketplace secret

**Issue**: "Recording not found"

- **Fix**: Wait 10-15 minutes after session ends (Zoom processing delay)
- **Fix**: Check if cloud recording is enabled in Zoom account

**Issue**: Download fails

- **Fix**: Ensure Zoom OAuth credentials are correct
- **Fix**: Check if download URL is still valid (expires in 24h)

## Production Checklist

- [ ] Zoom webhook configured with production URL
- [ ] `ZOOM_WEBHOOK_SECRET` added to production `.env`
- [ ] Cloud recording enabled in Zoom account
- [ ] Cloudinary/S3 configured and tested
- [ ] Server has enough disk space for temp downloads
- [ ] HTTPS enabled on server (required for webhooks)
- [ ] Error monitoring set up (e.g., Sentry)
- [ ] Cron job running in production
- [ ] Test recording end-to-end

## Future Enhancements

### Phase 2: Advanced Features

- [ ] Signed URLs with expiry for recordings
- [ ] Download rate limiting
- [ ] Recording analytics (view count, duration watched)
- [ ] Automatic transcript generation
- [ ] Recording quality selection (720p, 1080p)
- [ ] S3 implementation (currently Cloudinary only)

### Phase 3: Admin Features

- [ ] Bulk recording management
- [ ] Storage usage dashboard
- [ ] Recording retention policies (auto-delete after X days)
- [ ] Manual upload for non-Zoom recordings

## Support

For issues or questions, contact the development team or refer to:

- Zoom API Docs: https://developers.zoom.us/
- Cloudinary Docs: https://cloudinary.com/documentation
