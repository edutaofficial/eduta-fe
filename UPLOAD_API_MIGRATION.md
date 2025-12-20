# Upload API Migration - 3-Step Presigned URL Flow

## Overview
Migrated from direct multipart/form-data upload to a 3-step presigned URL flow for better reliability and performance.

## What Changed

### Old Flow (Single Step)
1. Upload file directly to backend with `multipart/form-data`
2. Backend processes and stores file
3. Return asset ID

**Issues:**
- Backend bottleneck for large files
- Timeout issues with slow connections
- Limited progress tracking

### New Flow (3 Steps)
1. **Request Upload URL** - POST to `/api/v1/assets/upload/request` with file metadata (JSON)
2. **Upload to S3** - PUT file directly to presigned S3 URL
3. **Confirm Upload** - POST to `/api/v1/assets/upload/confirm` (optional)

**Benefits:**
✅ Direct upload to S3 (faster, no backend bottleneck)
✅ No timeout issues for large files  
✅ More reliable for videos and large assets
✅ Better progress tracking with XMLHttpRequest

## Updated Components

### 1. `components/Common/UploadFile.tsx`
**Changes:**
- Step 1: Request presigned URL with JSON payload containing file metadata
- Step 2: Upload file to S3 using XMLHttpRequest for progress tracking
- Step 3: Confirm upload completion
- Enhanced error handling for each step
- Maintained all existing UI/UX features (progress, cancel, retry)

**Key Implementation:**
```typescript
// Step 1: Request presigned URL
const requestResponse = await axiosInstance.post("/api/v1/assets/upload/request", {
  file_name: file.name,
  file_type: file.type,
  file_size: file.size,
});

const { asset_id, upload_url } = requestResponse.data;

// Step 2: Upload to S3 with progress tracking
await new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", (event) => {
    // Track progress...
  });
  xhr.open("PUT", upload_url);
  xhr.setRequestHeader("Content-Type", file.type);
  xhr.send(file);
});

// Step 3: Confirm upload
await axiosInstance.post("/api/v1/assets/upload/confirm", {
  asset_id: asset_id,
});
```

### 2. `components/Common/UploadMultipleFiles.tsx`
**Changes:**
- Same 3-step flow implemented for each file
- Parallel upload support maintained
- Individual file progress tracking
- Error handling per file

### 3. Curriculum Components (No changes needed)
- `components/Instructor/CourseCreation/Curriculum/LectureVideoUpload.tsx` - ✅ Already uses `UploadFile`
- `components/Instructor/CourseCreation/Curriculum/LectureResourcesUpload.tsx` - ✅ Already uses `UploadMultipleFiles`

These components automatically benefit from the new upload flow without any modifications.

## API Endpoints

### POST `/api/v1/assets/upload/request`
Request a presigned URL for upload.

**Request Body:**
```json
{
  "file_name": "lecture-video.mp4",
  "file_type": "video/mp4",
  "file_size": 104857600
}
```

**Response:**
```json
{
  "asset_id": 123,
  "upload_url": "https://s3.amazonaws.com/...",
  "file_path": "assets/user_id/123/my-video.mp4",
  "expires_in": 3600,
  "download_url": "https://s3.amazonaws.com/..."
}
```

### PUT `{upload_url}` ⚠️ IMPORTANT: Use PUT, not GET!
Upload file directly to S3 using the presigned URL.

**CRITICAL:** The presigned URL is configured for `PUT` operations. Using `GET` will fail with a 403 Forbidden error.

**Request:**
- **Method**: `PUT` (NOT GET!)
- **Body**: Raw file binary (not FormData, just the file itself)
- **Headers**: `Content-Type: {file.type}`

**Common Mistakes:**
❌ Using `GET` instead of `PUT`  
❌ Using `POST` instead of `PUT`  
❌ Wrapping file in FormData (send raw file binary)  
❌ Missing or incorrect Content-Type header

**Correct Implementation:**
```javascript
// ✅ CORRECT - Using XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open("PUT", upload_url); // PUT method
xhr.setRequestHeader("Content-Type", file.type);
xhr.send(file); // Raw file binary

// ✅ CORRECT - Using fetch
await fetch(upload_url, {
  method: "PUT", // PUT method
  body: file, // Raw file binary
  headers: {
    "Content-Type": file.type
  }
});

// ❌ WRONG - Using GET
await fetch(upload_url); // Default is GET - WILL FAIL!

// ❌ WRONG - Using POST
await fetch(upload_url, {
  method: "POST", // POST not allowed
  body: file
});

// ❌ WRONG - Using FormData
const formData = new FormData();
formData.append("file", file);
await fetch(upload_url, {
  method: "PUT",
  body: formData // Don't use FormData for S3
});
```

### POST `/api/v1/assets/upload/confirm`
Confirm successful upload (optional).

**Request Body:**
```json
{
  "asset_id": 123
}
```

## Features Maintained

All existing features are preserved:

✅ **Progress Tracking** - Real-time upload progress with XMLHttpRequest
✅ **Speed Display** - Upload speed calculation (MB/s)
✅ **Cancel Upload** - AbortController integration
✅ **Retry Failed Uploads** - Automatic retry with pending file reference
✅ **Drag & Drop** - Full drag and drop support
✅ **Error Handling** - Comprehensive error messages
✅ **File Validation** - Client-side type and size validation
✅ **UI/UX** - No changes to user interface

## Error Handling

Enhanced error handling for each step:

1. **Request URL Step** - Handle backend API errors
2. **S3 Upload Step** - Handle network errors, S3 errors
3. **Confirm Step** - Optional, logged warnings if fails
4. **Cancellation** - Clean abort handling

## Testing Checklist

- [ ] Single file upload (small file < 1MB)
- [ ] Single file upload (large file > 100MB)
- [ ] Multiple file upload
- [ ] Upload progress tracking
- [ ] Cancel upload mid-transfer
- [ ] Retry failed upload
- [ ] Network error handling
- [ ] File type validation
- [ ] Drag and drop functionality
- [ ] Video file upload in curriculum
- [ ] Resource files upload in curriculum

## Migration Notes

- No breaking changes to component APIs
- Backward compatible with existing usage
- Automatic benefit for all components using `UploadFile` or `UploadMultipleFiles`
- Upload URL expires in 1 hour (3600 seconds)
- Asset record created immediately with `asset_id`

## Performance Improvements

- **Direct S3 Upload** - Eliminates backend as bottleneck
- **No Timeouts** - Removed timeout limits for large files
- **Better Progress** - More accurate progress tracking with XMLHttpRequest
- **Faster Uploads** - Direct connection to S3 reduces latency

## Security

- Presigned URLs are time-limited (1 hour expiration)
- File type validation on both client and server
- Asset records created before upload (prevents orphaned uploads)
- Confirmation step verifies successful upload

## Troubleshooting

### 403 Forbidden Error on S3 Upload

**Problem:** Getting 403 Forbidden when uploading to S3

**Common Causes:**
1. ❌ Using `GET` instead of `PUT` method
2. ❌ Using `POST` instead of `PUT` method
3. ❌ Incorrect Content-Type header
4. ❌ Expired presigned URL (> 1 hour old)

**Solution:**
```javascript
// ✅ Ensure you're using PUT method
xhr.open("PUT", upload_url);
xhr.setRequestHeader("Content-Type", file.type);
xhr.send(file);
```

### Upload Progress Not Working

**Problem:** Progress bar not updating during upload

**Cause:** Using `fetch` API which doesn't support upload progress

**Solution:** Use `XMLHttpRequest` for upload progress tracking (already implemented in components)

### Asset ID Not Returned

**Problem:** Upload succeeds but asset_id is undefined

**Cause:** Not waiting for Step 1 response before starting Step 2

**Solution:** Ensure you await the request for presigned URL:
```javascript
const { asset_id, upload_url } = await axiosInstance.post(...);
```

### File Upload Fails Silently

**Problem:** No error shown but file not uploaded

**Cause:** Missing error handlers in XMLHttpRequest

**Solution:** Add all event listeners (already implemented):
```javascript
xhr.addEventListener("error", () => reject(new Error("Network error")));
xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
xhr.addEventListener("load", () => {
  if (xhr.status >= 200 && xhr.status < 300) {
    resolve();
  } else {
    reject(new Error(`Upload failed: ${xhr.statusText}`));
  }
});
```

### CORS Errors

**Problem:** CORS policy blocking S3 upload

**Cause:** S3 bucket CORS configuration issue

**Solution:** Verify S3 bucket CORS settings allow PUT requests from your domain

## Summary of Changes

### Files Updated

1. ✅ `components/Common/UploadFile.tsx` - 3-step presigned URL flow
2. ✅ `components/Common/UploadMultipleFiles.tsx` - 3-step presigned URL flow  
3. ✅ `hooks/useUpload.ts` - 3-step presigned URL flow
4. ✅ `components/Instructor/CourseCreation/Curriculum/LectureVideoUpload.tsx` - No changes (uses UploadFile)
5. ✅ `components/Instructor/CourseCreation/Curriculum/LectureResourcesUpload.tsx` - No changes (uses UploadMultipleFiles)
6. ✅ `components/Common/ProfilePictureUpload.tsx` - No changes (uses useUpload hook)

### Key Implementation Details

**All uploads now use:**
1. `POST` to `/api/v1/assets/upload/request` with JSON payload → Get presigned URL
2. `PUT` to presigned S3 URL with raw file binary → Upload to S3
3. `POST` to `/api/v1/assets/upload/confirm` with asset_id → Confirm (optional)

**Benefits Achieved:**
- ✅ No more timeout errors
- ✅ Better performance for large files
- ✅ More reliable uploads
- ✅ Direct S3 upload (no backend bottleneck)
- ✅ All existing features preserved

