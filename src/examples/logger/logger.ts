import createPinoLogger from 'pino';
import type { Logger } from './types';

export const createLogger = (): Logger => createPinoLogger();
