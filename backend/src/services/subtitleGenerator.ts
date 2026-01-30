export default class SubtitleGeneratorService {
  static async createSRTSubtitle(subtitles: any[], outputPath: string) {
    try {
      const fs = await import('fs');
      let srtContent = '';

      subtitles.forEach((sub, index) => {
        const startTime = this.secondsToTimecode(sub.start, 'srt');
        const endTime = this.secondsToTimecode(sub.end, 'srt');

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${sub.text}\n\n`;
      });

      fs.writeFileSync(outputPath, srtContent, 'utf-8');
      return { success: true, message: `SRT file created with ${subtitles.length} subtitles` };
    } catch (error: any) {
      return { success: false, message: `Error creating SRT file: ${error.message}` };
    }
  }

  static async createVTTSubtitle(subtitles: any[], outputPath: string) {
    try {
      const fs = await import('fs');
      let vttContent = 'WEBVTT\n\n';

      subtitles.forEach(sub => {
        const startTime = this.secondsToTimecode(sub.start, 'vtt');
        const endTime = this.secondsToTimecode(sub.end, 'vtt');

        vttContent += `${startTime} --> ${endTime}\n`;
        vttContent += `${sub.text}\n\n`;
      });

      fs.writeFileSync(outputPath, vttContent, 'utf-8');
      return { success: true, message: `VTT file created with ${subtitles.length} subtitles` };
    } catch (error: any) {
      return { success: false, message: `Error creating VTT file: ${error.message}` };
    }
  }

  private static secondsToTimecode(seconds: number, format = 'srt'): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === 'vtt') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
    } else {
      const milliseconds = Math.round((secs % 1) * 1000);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(secs)).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    }
  }
}
