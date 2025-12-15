import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const generateVideoId = () => {
  return uuidv4();
};

export const generateClientPublicKey = () => {
  return crypto.randomBytes(16).toString('hex');
};
