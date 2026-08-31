import 'dotenv/config';
import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';
import logger from '../utils/logger.js';

const router = express.Router();

const supportedLanguages = {
  'hi-IN': 'hi-IN-Neural2-A',
  'en-IN': 'en-IN-Neural2-A',
};

const ttsClient = new textToSpeech.TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

router.post('/', async (req, res) => {
  const { text, language } = req.body;

  // Validate text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required and must not be empty' });
  }

  // Validate language code
  if (!language || !supportedLanguages[language]) {
    return res.status(400).json({
      error: `Language must be one of: ${Object.keys(supportedLanguages).join(', ')}`,
    });
  }

  logger.info(`Processing text-to-speech for language: ${language}`);

  // Prepare request
  const request = {
    input: { text: text.trim() },
    voice: {
      languageCode: language,
      name: supportedLanguages[language],
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  };

  // Call Google Cloud Text-to-Speech API
  const [response] = await ttsClient.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error('Failed to generate audio content');
  }

  // Convert audio content to base64
  const audioBase64 = Buffer.from(response.audioContent).toString('base64');

  res.json({
    audio: audioBase64,
    mimeType: 'audio/mpeg',
  });
});

export default router;