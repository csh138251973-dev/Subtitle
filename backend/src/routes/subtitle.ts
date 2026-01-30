import express, { Request, Response } from 'express';
import SpeechRecognizer from '../services/speechRecognizer.js';
import OCRService from '../services/ocrService.js';
import TranslatorService from '../services/translator.js';
import SubtitleGeneratorService from '../services/subtitleGenerator.js';
import QualityVerifier from '../services/qualityVerifier.js';
import { jobStorage } from '../utils/jobStorage.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Generate subtitles from audio
router.post('/generate-from-audio', async (req: Request, res: Response) => {
  try {
    const { job_id, language = 'en' } = req.body;

    if (!jobStorage.hasJob(job_id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(job_id);
    if (!job || !job.audio_path) {
      return res.status(400).json({ error: 'Audio path not found. Please extract audio first.' });
    }

    const speechRecognizer = new SpeechRecognizer();
    const result = await speechRecognizer.transcribeAudio(job.audio_path, language);

    if (result && result.subtitles && result.subtitles.length > 0) {
      jobStorage.setJob(job_id, {
        subtitles: result.subtitles,
        status: 'completed',
      });

      console.log(`🎯 Subtitles generated: ${job_id} - ${result.subtitles.length} segments`);

      res.json({
        success: true,
        job_id,
        subtitles: result.subtitles.slice(0, 10),
        total_segments: result.subtitles.length,
        message: `Generated ${result.subtitles.length} subtitle segments`,
      });
    } else {
      res.status(500).json({ error: 'Failed to generate subtitles from audio' });
    }
  } catch (error: any) {
    console.error('Generate audio subtitles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate subtitles from OCR
router.post('/generate-from-ocr', async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    if (!jobStorage.hasJob(job_id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(job_id);
    if (!job || !job.video_path) {
      return res.status(400).json({ error: 'Video path not found' });
    }

    const ocrService = new OCRService();
    const result = await ocrService.extractSubtitlesFromVideo(job.video_path);

    if (result && result.subtitles && result.subtitles.length > 0) {
      jobStorage.setJob(job_id, {
        subtitles: result.subtitles,
        status: 'completed',
      });

      console.log(`📸 OCR subtitles extracted: ${job_id} - ${result.subtitles.length} segments`);

      res.json({
        success: true,
        job_id,
        subtitles: result.subtitles.slice(0, 10),
        total_segments: result.subtitles.length,
        message: `Extracted ${result.subtitles.length} subtitles from video frames`,
      });
    } else {
      res.status(500).json({ error: 'Failed to extract subtitles from video' });
    }
  } catch (error: any) {
    console.error('Generate OCR subtitles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translate subtitles
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { job_id, detect_domain = true } = req.body;

    if (!jobStorage.hasJob(job_id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(job_id);
    if (!job || !job.subtitles || job.subtitles.length === 0) {
      return res.status(400).json({ error: 'No subtitles found. Generate subtitles first.' });
    }

    const subtitles = job.subtitles;
    const translator = new TranslatorService();

    // Detect domain if requested
    let domain = null;
    if (detect_domain) {
      const textContent = subtitles.map((s: any) => s.text).join(' ');
      domain = translator.detectDomain(textContent);
    }

    // Translate to Chinese
    const translated = await translator.translateSubtitles(subtitles, 'zh-CN', domain || undefined);

    jobStorage.setJob(job_id, {
      translated_subtitles: translated,
    });

    console.log(`🌐 Subtitles translated: ${job_id} - Domain: ${domain}`);

    res.json({
      success: true,
      job_id,
      domain,
      translated_subtitles: translated.slice(0, 10),
      total_segments: translated.length,
      message: 'Subtitles translated to Chinese',
    });
  } catch (error: any) {
    console.error('Translate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify quality
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    if (!jobStorage.hasJob(job_id)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(job_id);
    if (!job || (!job.subtitles && !job.translated_subtitles)) {
      return res.status(400).json({ error: 'No subtitles to verify' });
    }

    const subtitlesToVerify = job.translated_subtitles || job.subtitles;
    const verifier = new QualityVerifier();
    const report = verifier.verifyQuality(subtitlesToVerify);

    jobStorage.setJob(job_id, {
      quality_report: report,
    });

    console.log(`✅ Quality verification: ${job_id} - Score: ${report.overall_quality_score}`);

    res.json({
      success: true,
      job_id,
      quality_report: report,
      message: 'Quality verification completed',
    });
  } catch (error: any) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export subtitles
router.get('/export/:jobId', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const format = (req.query.format as string) || 'srt'; // srt or vtt

    if (!jobStorage.hasJob(jobId)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobStorage.getJob(jobId);
    if (!job || (!job.subtitles && !job.translated_subtitles)) {
      return res.status(400).json({ error: 'No subtitles to export' });
    }

    const subtitles = job.translated_subtitles || job.subtitles;
    const filePath = path.join(process.cwd(), 'temp', `${jobId}.${format === 'vtt' ? 'vtt' : 'srt'}`);

    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate subtitle file
    const subtitleGenerator = new SubtitleGeneratorService();
    if (format === 'vtt') {
      await SubtitleGeneratorService.createVTTSubtitle(subtitles, filePath);
    } else {
      await SubtitleGeneratorService.createSRTSubtitle(subtitles, filePath);
    }

    res.download(filePath, `subtitles.${format}`, (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
