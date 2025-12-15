# Video Streaming Backend

## Overview
Express backend for uploading videos, generating HLS streams (240p, 480p, 720p), and serving metadata via API.
Designed for deployment on a specific host (e.g. Hostinger VPS with cPanel) where `public_html/videos` acts as the storage.

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB (Running locally or remote URI)
- FFmpeg installed and in PATH (or specified in .env)

### 2. Configuration
Copy `.env.example` to `.env` and adjust the variables:

```bash
cp .env.example .env
```

**Key Variables:**
- `VIDEO_ROOT_ABSOLUTE`: This is critical. It must point to the absolute path where you want the HLS files to be stored.
  - On cPanel/VPS: `/home/<username>/public_html/videos`
  - On Local Dev: `C:/Users/You/project/videos_storage` (or similar)
- `PUBLIC_BASE_URL`: The URL base that points to the above folder via HTTP.
  - On Prod: `https://your-domain.com/videos`
  - On Local: `http://localhost/videos` (if serving statically via Nginx/Apache)

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Usage

### Upload Video (Admin)
**Endpoint:** `POST /api/videos/upload`
**Content-Type:** `multipart/form-data`

**Fields:**
- `video`: The video file (MP4, MOV, etc.)
- `clientName`: string (e.g., "ClientA")
- `orientation`: "portrait" | "landscape"
- `title`: string (optional)

**Response:**
Returns JSON with `videoId`, `clientPublicKey`, and `masterPlaylistUrl`.

### List Videos
**Endpoint:** `GET /api/videos/:clientPublicKey/:orientation`

## Testing Upload
You can use Postman or curl:

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@/path/to/video.mp4" \
  -F "clientName=TestClient" \
  -F "orientation=landscape"
```

## cPanel Deployment Notes
1. SSH into VPS.
2. Clone this repo outside public_html (e.g. `~/video-backend`).
3. Set `VIDEO_ROOT_ABSOLUTE` to `/home/user/public_html/videos`.
4. Run `npm install --production`.
5. Use PM2 to run the server: `pm2 start src/index.js --name video-api`.
6. Configure Apache/Nginx (via cPanel "Application Manager" or .htaccess if needed) to reverse proxy `/api` to `localhost:3000`. OR just access port 3000 directly if firewall allows.
