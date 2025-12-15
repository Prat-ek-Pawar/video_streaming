import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getTargetVideoFolder = (clientPublicKey, orientation, videoId) => {
  const folder = path.join(
    config.videoRootAbsolute,
    clientPublicKey,
    orientation,
    videoId
  );
  return folder;
};

export const createTargetVideoFolder = (clientPublicKey, orientation, videoId) => {
  const folder = getTargetVideoFolder(clientPublicKey, orientation, videoId);
  ensureDir(folder);
  return folder;
};

export const getPublicUrl = (clientPublicKey, orientation, videoId, filename) => {
  const base = config.publicBaseUrl.replace(/\/$/, '');
  return `${base}/${clientPublicKey}/${orientation}/${videoId}/${filename}`;
};
