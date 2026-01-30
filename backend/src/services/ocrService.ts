import Tesseract from 'tesseract.js';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default class OCRService {
  async extractSubtitlesFromVideo(videoPath: string) {
    try {
      const tempDir = 'temp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Extract frames from video
      const frameDir = path.join(tempDir, `frames_${uuidv4()}`);
      fs.mkdirSync(frameDir, { recursive: true });

      const { frames, duration } = await this.extractFrames(videoPath, frameDir);

      // Process frames with OCR
      const subtitles = await this.processFramesWithOCR(frames, duration);

      // Cleanup
      this.cleanupFrames(frameDir);

      return {
        success: true,
        subtitles
      };
    } catch (error: any) {
      console.error('OCR error:', error);
      return {
        success: false,
        message: `OCR error: ${error.message}`
      };
    }
  }

  private async extractFrames(videoPath: string, outputDir: string): Promise<{ frames: string[]; duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);

        const duration = metadata.format.duration || 0;
        const fps = 1; // Extract 1 frame per second

        ffmpeg(videoPath)
          .output(path.join(outputDir, 'frame_%03d.png'))
          .withFps(fps)
          .on('error', reject)
          .on('end', () => {
            const frames = fs.readdirSync(outputDir)
              .filter(f => f.endsWith('.png'))
              .map(f => path.join(outputDir, f))
              .sort();

            resolve({ frames, duration });
          })
          .run();
      });
    });
  }

  private async processFramesWithOCR(frames: string[], totalDuration: number) {
    const subtitles = [];
    const intervalDuration = totalDuration / frames.length;

    for (let i = 0; i < frames.length; i++) {
      const framePath = frames[i];
      const startTime = i * intervalDuration;
      const endTime = (i + 1) * intervalDuration;

      try {
        const result = await Tesseract.recognize(framePath, 'eng+chi_sim');
        const text = result.data.text.trim();

        if (text) {
          subtitles.push({
            index: i + 1,
            start: startTime,
            end: endTime,
            text: text,
            confidence: result.data.confidence
          });
        }
      } catch (error) {
        console.warn(`OCR failed for frame ${i}:`, error);
      }
    }

    return subtitles;
  }

  private cleanupFrames(frameDir: string) {
    if (fs.existsSync(frameDir)) {
      fs.rmSync(frameDir, { recursive: true, force: true });
    }
  }
}
