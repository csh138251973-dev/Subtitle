import express, { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import VideoProcessorService from '../services/videoProcessor.js';

const router = express.Router();

// In-memory job storage
const processingJobs: Record<string, any> = {};

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = req.app.get('uploadDir');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000 * 1024 * 1024 }
});

router.use((req, res, next) => {
  (req as any).processingJobs = processingJobs;
  next();
});

// Upload video
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filepath = req.file.path;
    const filename = req.file.originalname;

    const { isValid, message } = VideoProcessorService.validateVideoFile(filepath);
    if (!isValid) {
      fs.unlinkSync(filepath);
      return res.status(400).json({ error: message });
    }

    const metadata = await VideoProcessorService.getVideoMetadata(filepath);

    const jobId = uuidv4();
    processingJobs[jobId] = {
      status: 'uploaded',
      video_path: filepath,
      original_filename: filename,
      metadata,
      created_at: new Date().toISOString()
    };

    console.log(`📹 Video uploaded: ${jobId} - ${filename}`);

    res.json({
      job_id: jobId,
      filename,
      size: fs.statSync(filepath).size,
      metadata,
      message: 'Video uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Extract audio
router.post('/extract-audio/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!processingJobs[jobId]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[jobId];
    const videoPath = job.video_path;

    const tempDir = req.app.get('tempDir');
    const audioPath = path.join(tempDir, `${uuidv4()}.mp3`);

    const { success, message } = await VideoProcessorService.extractAudio(videoPath, audioPath);

    if (!success) {
      return res.status(500).json({ error: message });
    }

    job.audio_path = audioPath;
    job.status = 'audio_extracted';

    console.log(`🎵 Audio extracted: ${jobId}`);

    res.json({
      job_id: jobId,
      audio_path: audioPath,
      message
    });
  } catch (error: any) {
    console.error('Audio extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get status
router.get('/status/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!processingJobs[jobId]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[jobId];

    res.json({
      job_id: jobId,
      status: job.status,
      created_at: job.created_at,
      progress: {
        uploaded: true,
        audio_extracted: 'audio_path' in job,
        subtitles_generated: 'subtitles' in job,
        subtitles_translated: 'translated_subtitles' in job,
        ocr_processed: 'ocr_subtitles' in job,
        quality_verified: 'quality_report' in job
      },
      current_step: job.status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
