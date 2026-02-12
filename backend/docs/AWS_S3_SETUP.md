# AWS S3 Recording Storage - Configuration Guide

## Updated Configuration

The recording system now uses **AWS S3** instead of Cloudinary for storage.

## Environment Variables

Update your `.env` file with these AWS credentials:

```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
RECORDING_STORAGE_PROVIDER=s3
```

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Configure Bucket Policy (Optional - for public access)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/recordings/*"
    }
  ]
}
```

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create new user with programmatic access
3. Attach policy: `AmazonS3FullAccess` or custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Copy Access Key ID and Secret Access Key

## File Structure

Recordings are stored in S3 with this structure:

```
s3://your-bucket-name/
  └── recordings/
      └── {bookingId}/
          └── {meetingId}.mp4
```

## Recording URL Format

```
https://your-bucket-name.s3.us-east-1.amazonaws.com/recordings/{bookingId}/{meetingId}.mp4
```

## Changes Made

1. ✅ Installed `@aws-sdk/client-s3`
2. ✅ Updated `storageService.js` to use S3
3. ✅ Removed all comments from code files
4. ✅ Updated `.env` with S3 configuration
5. ✅ All syntax validated successfully

## Testing

```bash
curl -X GET http://localhost:8085/api/bookings/:id/recording \
  -H "Authorization: Bearer TOKEN"
```

Expected response will now show S3 URL instead of Cloudinary URL.
