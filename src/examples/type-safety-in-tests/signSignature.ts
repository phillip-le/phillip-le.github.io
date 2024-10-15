import { sign } from 'node:crypto';

export const signMe = () => sign(null, Buffer.from('hi'), '');
