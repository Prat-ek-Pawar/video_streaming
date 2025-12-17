import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import ffmpegStatic from 'ffmpeg-static';

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/video_streaming',
  videoRootAbsolute: process.env.VIDEO_ROOT_ABSOLUTE || path.resolve(process.cwd(), 'videos_storage'),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://api.thedigitechsolutions.com/videos-static',
  ffmpegPath: process.env.FFMPEG_PATH || ffmpegStatic,
};
