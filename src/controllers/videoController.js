import * as videoService from '../services/videoService.js';

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const { clientName, orientation, title } = req.body;

    if (!clientName || !orientation) {
      return res.status(400).json({ error: 'clientName and orientation are required' });
    }

    if (!['portrait', 'landscape'].includes(orientation)) {
      return res.status(400).json({ error: 'orientation must be portrait or landscape' });
    }

    const result = await videoService.processVideoUpload({
      clientName,
      orientation,
      originalname: req.file.originalname,
      path: req.file.path,
      title
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getVideoStatus = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const status = await videoService.getVideoStatus(videoId);
    
    if (!status) {
        return res.status(404).json({ error: 'Video not found' });
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
};

export const listVideos = async (req, res, next) => {
  try {
    const { clientPublicKey, orientation } = req.params;
    
    const videos = await videoService.getVideosForClient(clientPublicKey, orientation);
    res.json(videos);
  } catch (error) {
    next(error);
  }
};
