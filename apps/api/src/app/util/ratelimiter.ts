import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '../config/secrets';

const limitInSeconds = (seconds: number) => rateLimit({ windowMs: NODE_ENV !== 'test' && seconds * 1000, max: 1 });

export { limitInSeconds };
