import { OpenAI } from 'openai';
import fs from 'fs';

export default class SpeechRecognizerService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async transcribeAudio(audioPath: string, language = 'en') {
    try {
      if (!fs.existsSync(audioPath)) {
        return {
          success: false,
          message: 'Audio file not found'
        };
      }

      const audioStream = fs.createReadStream(audioPath);

      const transcript = await this.openai.audio.transcriptions.create({
        file: audioStream as any,
        model: 'whisper-1',
        language: language === 'en' ? 'en' : language,
        response_format: 'verbose_json'
      });

      const subtitles = this.formatTranscriptToSubtitles(transcript as any);

      return {
        success: true,
        subtitles
      };
    } catch (error: any) {
      console.error('Transcription error:', error);
      return {
        success: false,
        message: `Transcription error: ${error.message}`
      };
    }
  }

  private formatTranscriptToSubtitles(transcript: any) {
    const subtitles = [];

    if (transcript.segments) {
      transcript.segments.forEach((segment: any) => {
        subtitles.push({
          index: segment.id + 1,
          start: segment.start,
          end: segment.end,
          text: segment.text.trim()
        });
      });
    } else if (transcript.text) {
      const duration = 5;
      const words = transcript.text.split(' ');
      let currentText = '';
      let startTime = 0;

      words.forEach((word: string, index: number) => {
        currentText += word + ' ';

        if ((index + 1) % 10 === 0 || index === words.length - 1) {
          subtitles.push({
            index: subtitles.length + 1,
            start: startTime,
            end: startTime + duration,
            text: currentText.trim()
          });
          startTime += duration;
          currentText = '';
        }
      });
    }

    return subtitles;
  }
}
