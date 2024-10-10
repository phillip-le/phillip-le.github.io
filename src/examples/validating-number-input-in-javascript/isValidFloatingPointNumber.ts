import { z } from 'zod';

const floatingPointNumberSchema = z.string().pipe(z.coerce.number());

export const isValidFloatingPointNumberZod = (input: string) => {
  return floatingPointNumberSchema.safeParse(input).success;
};

export const isValidFloatingPointNumberWithNumber = (input: string) => {
  const parsedInput = Number(input);
  return !Number.isNaN(parsedInput);
};
