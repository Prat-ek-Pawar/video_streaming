import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

import ffmpegStatic from 'ffmpeg-static';

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/video_streaming',
  
  // Storage paths
  // Default to a folder relative to CWD if not specified (for dev safety), but in prod should be explicit
  videoRootAbsolute: process.env.VIDEO_ROOT_ABSOLUTE || path.resolve(process.cwd(), 'videos_storage'),
  
  // Public URL base
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://api.thedigitechsolutions.com/videos-static',
  
  // FFMPEG
  // Use environment variable if set, otherwise fallback to the static binary which works everywhere
  ffmpegPath: process.env.FFMPEG_PATH || ffmpegStatic,
};
