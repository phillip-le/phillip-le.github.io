import { z } from 'zod';

export const isValidFloatingPointNumberZod = (input: string) => {
  return z.string().pipe(z.coerce.number()).safeParse(input).success;
};

export const isValidFloatingPointNumberWithNumber = (input: string) => {
  const parsedInput = Number(input);
  return !Number.isNaN(parsedInput);
};

export const isValidFloatingPointNumberRegex = (input: string) => {
  return /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(input);
};
