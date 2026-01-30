import express, { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import VideoProcessorService from '../services/videoProcessor.js';
import { jobStorage } from '../utils/jobStorage.js';

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000 * 1024 * 1024 } // 5GB
});

// Error handling middleware for multer
const uploadMiddleware = (req: Request, res: Response, next: any) => {
  upload.single('video')(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Max 5GB allowed.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Field name must be "video". Unexpected field received.' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
};

// Upload video endpoint
router.post('/upload', uploadMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = uuidv4();
    const filePath = req.file.path;

    // Validate video file
    const validation = VideoProcessorService.validateVideoFile(filePath);
    if (!validation.isValid) {
      fs.unlinkSync(filePath); // Delete invalid file
      return res.status(400).json({ error: validation.message });
    }

    // Store job in global storage
    jobStorage.setJob(jobId, {
      video_path: filePath,
      status: 'uploading',
      created_at: new Date().toISOString(),
    });

    console.log(`📹 Video uploaded: ${jobId} - ${req.file.originalname}`);

    res.json({
      success: true,
      job_id: jobId,
      filename: req.file.originalname,
      file_size: req.file.size,
      message: 'Video uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Extract audio endpoint
router.post('/extract-audio/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobStorage.hasJob(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(jobId);
    if (!job || !job.video_path) {
      return res.status(400).json({ error: 'Video path not found in job' });
    }

    const audioPath = path.join(path.dirname(job.video_path), `${jobId}-audio.mp3`);

    // Extract audio
    const result = await VideoProcessorService.extractAudio(job.video_path, audioPath);

    if (result.success) {
      jobStorage.setJob(jobId, { audio_path: audioPath, status: 'processing' });
      console.log(`🎵 Audio extracted: ${jobId}`);
      res.json({ success: true, job_id: jobId, audio_path: audioPath, message: 'Audio extracted successfully' });
    } else {
      res.status(500).json({ success: false, error: result.message });
    }
  } catch (error: any) {
    console.error('Extract audio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job status endpoint
router.get('/status/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobStorage.hasJob(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(jobId);
    res.json(job);
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
