import fs from 'fs';
import { Client } from '../db/models/Client.js';
import { Video } from '../db/models/Video.js';
import { generateClientPublicKey, generateVideoId } from '../utils/idGenerator.js';
import * as storageService from './storageService.js';
import * as ffmpegService from './ffmpegService.js';

export const processVideoUpload = async ({ clientName, orientation, originalname, path: tempPath, title }) => {
  console.log(`Processing upload for client: ${clientName}, file: ${originalname}`);
  
  let client = await Client.findOne({ name: clientName });
  
  if (!client) {
    try {
      client = new Client({
        name: clientName,
        publicKey: generateClientPublicKey(),
      });
      await client.save();
    } catch (err) {
      if (err.code === 11000) {
        client = await Client.findOne({ name: clientName });
        if (!client) throw err; 
      } else {
        throw err;
      }
    }
  }

  const videoId = generateVideoId();
  
  const video = new Video({
    clientId: client._id,
    orientation,
    status: 'uploading',
    sourceFilename: originalname,
    videoId,
  });
  await video.save();

  try {
    const outputDir = storageService.createTargetVideoFolder(client.publicKey, orientation, videoId);
    
    video.status = 'processing';
    await video.save();

    transcodeInBackground(tempPath, outputDir, video).catch(err => {
        console.error(`Background transcoding failed for video ${videoId}:`, err);
    });

    const masterPlaylistUrl = storageService.getPublicUrl(client.publicKey, orientation, videoId, 'master.m3u8');
    
    const predictedQualities = [240, 480, 720].map(q => ({
        quality: q,
        playlistUrl: storageService.getPublicUrl(client.publicKey, orientation, videoId, `${q}p.m3u8`)
    }));

    return {
      clientPublicKey: client.publicKey,
      videoId,
      orientation,
      status: 'processing',
      masterPlaylistUrl, 
      qualities: predictedQualities
    };

  } catch (error) {
    console.error('Video setup failed:', error);
    video.status = 'failed';
    video.lastError = error.message;
    await video.save();
    
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (e) {}

    throw error;
  }
};

const transcodeInBackground = async (tempPath, outputDir, video) => {
    try {
        const result = await ffmpegService.transcodeVideo(tempPath, outputDir);

        video.status = 'ready';
        video.masterPlaylistPath = result.masterPlaylist;
        video.qualities = result.variants.map(v => ({
            quality: v.quality,
            playlistPath: v.playlist,
            segmentDurationSeconds: 2
        }));
        await video.save();

    } catch (error) {
        console.error(`Transcoding error for video ${video.videoId}:`, error);
        video.status = 'failed';
        video.lastError = error.message;
        await video.save();
    } finally {
        try {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (e) {
            console.error('Failed to delete temp file:', e);
        }
    }
};

export const getVideosForClient = async (clientPublicKey, orientation) => {
  const client = await Client.findOne({ publicKey: clientPublicKey });
  if (!client) return [];

  const videos = await Video.find({ clientId: client._id, orientation, status: 'ready' }).sort({ createdAt: -1 });

  return videos.map(v => ({
    videoId: v.videoId,
    orientation: v.orientation,
    status: v.status,
    createdAt: v.createdAt,
    masterPlaylistUrl: storageService.getPublicUrl(client.publicKey, v.orientation, v.videoId, v.masterPlaylistPath)
  }));
};
