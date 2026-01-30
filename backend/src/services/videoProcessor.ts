import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const SUPPORTED_FORMATS = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm', '.wmv', '.m4v'];

export default class VideoProcessorService {
  static validateVideoFile(filePath: string): { isValid: boolean; message: string } {
    if (!fs.existsSync(filePath)) {
      return { isValid: false, message: 'File does not exist' };
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return {
        isValid: false,
        message: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}`
      };
    }

    return { isValid: true, message: 'Valid' };
  }

  static async extractAudio(videoPath: string, outputPath: string, format = 'mp3') {
    return new Promise((resolve) => {
      ffmpeg(videoPath)
        .output(outputPath)
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          resolve({ success: false, message: `Error extracting audio: ${err.message}` });
        })
        .on('end', () => {
          console.log(`Audio extracted to ${outputPath}`);
          resolve({ success: true, message: `Audio extracted to ${outputPath}` });
        })
        .run();
    });
  }

  static async getVideoMetadata(videoPath: string): Promise<any> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('Error getting metadata:', err);
          resolve(null);
          return;
        }

        const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
        const audioStream = metadata.streams.find((s: any) => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration,
          fps: videoStream?.r_frame_rate,
          width: videoStream?.width,
          height: videoStream?.height,
          file_size: metadata.format.size,
          has_audio: !!audioStream
        });
      });
    });
  }
}
