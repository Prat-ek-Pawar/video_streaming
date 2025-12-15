import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    required: true,
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading',
    required: true,
  },
  sourceFilename: {
    type: String,
  },
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  qualities: [{
    quality: {
      type: Number, 
      enum: [240, 480, 720],
    },
    playlistPath: String, 
    segmentDurationSeconds: Number
  }],
  masterPlaylistPath: {
    type: String,
  },
  retries: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Video = mongoose.model('Video', videoSchema);
