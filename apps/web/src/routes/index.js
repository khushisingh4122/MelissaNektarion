import { Router } from 'express';
import healthCheck from './health-check.js';
import speechToTextRouter from './speech-to-text.js';
import textToSpeechRouter from './text-to-speech.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/speech-to-text', speechToTextRouter);
    router.use('/text-to-speech', textToSpeechRouter);

    return router;
};