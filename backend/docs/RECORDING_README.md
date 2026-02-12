# Automated Zoom Recording System

## 🎯 Overview

**FULLY AUTOMATED** backend system that handles Zoom cloud recordings without any teacher or student involvement.

## ⚡ Quick Start

### 1. Configure Zoom Webhook

```bash
# 1. Go to https://marketplace.zoom.us/
# 2. Your App → Event Subscriptions
# 3. Add endpoint: https://yourdomain.com/api/webhooks/zoom
# 4. Subscribe to: recording.completed
# 5. Copy Secret Token
```

### 2. Update .env

```bash
ZOOM_WEBHOOK_SECRET=your_secret_token_here
RECORDING_STORAGE_PROVIDER=s3
```

### 3. Restart Server

```bash
npm run dev
```

## 📚 Full Documentation

See [ZOOM_RECORDING_SETUP.md](./ZOOM_RECORDING_SETUP.md) for complete setup instructions.

## 🔑 Key Features

✅ **Automated Processing**: Backend downloads and uploads recordings automatically  
✅ **Webhook + Cron**: Real-time webhook with 10-min cron fallback  
✅ **Access Control**: Student/Teacher can view, Admin can download  
✅ **Pluggable Storage**: Cloudinary (default) or S3  
✅ **Error Handling**: Automatic retries, detailed logging  
✅ **Security**: OAuth authentication, signature validation

## 🏗️ Architecture

```
Session Ends → Zoom Processes → Webhook Triggers → Backend Downloads →
Upload to Storage → Update Booking → Ready for Viewing
```

**Fallback**: Cron job runs every 10 minutes to catch missed webhooks.

## 📡 API Endpoints

| Method | Endpoint                            | Access                | Description         |
| ------ | ----------------------------------- | --------------------- | ------------------- |
| GET    | `/api/bookings/:id/recording`       | Student/Teacher/Admin | Get recording       |
| GET    | `/api/recordings`                   | Admin                 | List all recordings |
| POST   | `/api/webhooks/zoom`                | Public (validated)    | Zoom webhook        |
| POST   | `/api/webhooks/zoom/manual-trigger` | Admin                 | Manual trigger      |

## 🔒 Access Control

| Role    | View Own | View All | Download |
| ------- | -------- | -------- | -------- |
| Student | ✅       | ❌       | ❌       |
| Teacher | ✅       | ❌       | ❌       |
| Admin   | ✅       | ✅       | ✅       |

## 🧪 Testing

### Test Webhook

```bash
curl http://localhost:8085/api/webhooks/zoom -d '{
  "event": "endpoint.url_validation",
  "payload": {"plainToken": "test"}
}'
```

### Manual Trigger (Admin)

```bash
curl -X POST http://localhost:8085/api/webhooks/zoom/manual-trigger \
  -H "Authorization: Bearer TOKEN" \
  -d '{"meetingId": "123456789"}'
```

## 📊 Monitoring

Check logs for:

- `📨 Zoom webhook received` - Webhook events
- `🎬 Processing recording` - Processing started
- `✅ Recording processed successfully` - Success
- `⏰ [CRON] Recording retry job` - Cron runs

## ⚠️ Important Notes

1. **Backend-Only**: Teachers and students DO NOT upload recordings
2. **Zoom Delay**: Recordings take 5-15 minutes to process after session
3. **Webhook Secret**: Must be set in `.env` for security
4. **Cloud Recording**: Must be enabled in Zoom account settings
5. **Storage**: Cloudinary already configured, S3 can be added later

## 🐛 Troubleshooting

| Issue               | Solution                                           |
| ------------------- | -------------------------------------------------- |
| Webhook not working | Check URL is accessible, secret token matches      |
| Recording not found | Wait 10-15 min, check Zoom cloud recording enabled |
| Download fails      | Check OAuth credentials, download URL expiry       |

## 📝 Files Created

```
backend/
├── models/bookingModel.js           # Updated with recording field
├── services/
│   ├── storageService.js             # Cloudinary/S3 upload
│   ├── recordingService.js           # Download & process logic
│   └── zoomService.js                # Updated: cloud recording enabled
├── controllers/
│   ├── zoomWebhookController.js      # Webhook handler
│   └── recordingController.js        # Access control
├── routes/
│   ├── webhookRoutes.js              # Webhook endpoints
│   └── recordingRoutes.js            # Recording endpoints
├── jobs/recordingCron.js             # Fallback cron job
└── docs/
    ├── ZOOM_RECORDING_SETUP.md       # Full setup guide
    └── RECORDING_README.md           # This file
```

## 🚀 Next Steps

1. Configure Zoom webhook (see setup guide)
2. Test with a real booking
3. Monitor logs for processing
4. Verify recording accessible via API

---

Built with ❤️ for automated recording management
