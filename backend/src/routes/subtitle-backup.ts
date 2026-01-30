import express, { Request, Response } from 'express';
import SpeechRecognizerService from '../services/speechRecognizer.js';
import TranslationService from '../services/translator.js';
import SubtitleGeneratorService from '../services/subtitleGenerator.js';
import OCRService from '../services/ocrService.js';
import QualityVerifierService from '../services/qualityVerifier.js';
import DomainKnowledgeService from '../services/domainKnowledge.js';

const router = express.Router();

let processingJobs: Record<string, any> = {};

router.use((req, res, next) => {
  processingJobs = (req as any).processingJobs || processingJobs;
  (req as any).processingJobs = processingJobs;
  next();
});

// Generate subtitles from audio
router.post('/generate-from-audio', async (req: Request, res: Response) => {
  try {
    const { job_id, language = 'en' } = req.body;

    if (!processingJobs[job_id]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[job_id];

    if (!job.audio_path) {
      return res.status(400).json({ error: 'Audio not extracted yet' });
    }

    const recognizer = new SpeechRecognizerService();
    const result = await recognizer.transcribeAudio(job.audio_path, language);

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    job.subtitles = result.subtitles;
    job.subtitle_language = language;
    job.status = 'subtitles_generated';

    console.log(`🎯 Subtitles generated: ${job_id} - ${result.subtitles.length} segments`);

    res.json({
      job_id,
      subtitles: result.subtitles.slice(0, 10),
      total_segments: result.subtitles.length,
      language,
      message: `Generated ${result.subtitles.length} subtitle segments`
    });
  } catch (error: any) {
    console.error('Subtitle generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OCR subtitle extraction from video
router.post('/generate-from-ocr', async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    if (!processingJobs[job_id]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[job_id];
    const videoPath = job.video_path;

    const ocrService = new OCRService();
    const result = await ocrService.extractSubtitlesFromVideo(videoPath);

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    job.ocr_subtitles = result.subtitles;
    job.status = 'ocr_processed';

    console.log(`📸 OCR subtitles extracted: ${job_id} - ${result.subtitles.length} segments`);

    res.json({
      job_id,
      subtitles: result.subtitles.slice(0, 10),
      total_segments: result.subtitles.length,
      message: `Extracted ${result.subtitles.length} subtitles from video frames`
    });
  } catch (error: any) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translate subtitles to Chinese
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { job_id, detect_domain = true } = req.body;

    if (!processingJobs[job_id]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[job_id];
    const subtitles = job.subtitles || job.ocr_subtitles;

    if (!subtitles) {
      return res.status(400).json({ error: 'No subtitles to translate' });
    }

    // Detect domain
    let domain = null;
    if (detect_domain && subtitles.length > 0) {
      domain = DomainKnowledgeService.detectDomain(subtitles[0].text);
    }

    const translator = new TranslationService();
    const translated = await translator.translateSubtitles(subtitles, 'zh-CN', domain);

    job.translated_subtitles = translated;
    job.target_language = 'zh-CN';
    job.detected_domain = domain;
    job.status = 'subtitles_translated';

    console.log(`🌐 Subtitles translated: ${job_id} - Domain: ${domain}`);

    res.json({
      job_id,
      translated_subtitles: translated.slice(0, 10),
      total_segments: translated.length,
      target_language: 'zh-CN',
      detected_domain: domain,
      message: `Translated ${translated.length} subtitles to Chinese`
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify translation quality
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    if (!processingJobs[job_id]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[job_id];

    if (!job.translated_subtitles) {
      return res.status(400).json({ error: 'No translated subtitles to verify' });
    }

    const verifier = new QualityVerifierService();
    const report = verifier.generateQualityReport(
      job.translated_subtitles,
      job.subtitles || job.ocr_subtitles,
      job.metadata?.duration,
      job.detected_domain
    );

    job.quality_report = report;
    job.status = 'quality_verified';

    console.log(`✅ Quality verification: ${job_id} - Score: ${report.overall_quality_score}`);

    res.json({
      job_id,
      quality_report: report,
      message: 'Quality verification complete'
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export subtitles
router.get('/export/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const format = req.query.format || 'srt';

    if (!processingJobs[jobId]) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = processingJobs[jobId];

    if (!job.translated_subtitles) {
      return res.status(400).json({ error: 'No subtitles to export' });
    }

    const tempDir = req.app.get('tempDir');
    const subtitleGenerator = new SubtitleGeneratorService();

    let filePath: string;
    let filename: string;
    let mimeType: string;

    if (format === 'vtt') {
      filePath = `${tempDir}/export_${jobId}.vtt`;
      filename = `${jobId}.vtt`;
      mimeType = 'text/vtt';
      await subtitleGenerator.createVTTSubtitle(job.translated_subtitles, filePath);
    } else {
      filePath = `${tempDir}/export_${jobId}.srt`;
      filename = `${jobId}.srt`;
      mimeType = 'text/plain';
      await subtitleGenerator.createSRTSubtitle(job.translated_subtitles, filePath);
    }

    console.log(`💾 Subtitle exported: ${jobId}`);

    res.download(filePath, filename, (err) => {
      if (err) console.error('Download error:', err);
      setTimeout(() => {
        if (require('fs').existsSync(filePath)) {
          require('fs').unlinkSync(filePath);
        }
      }, 1000);
    });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
