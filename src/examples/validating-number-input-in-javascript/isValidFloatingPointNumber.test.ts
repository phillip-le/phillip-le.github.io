import {
  isValidFloatingPointNumberRegex,
  isValidFloatingPointNumberWithNumber,
  isValidFloatingPointNumberZod,
} from './isValidFloatingPointNumber';

describe('isValidFloatingPointNumber', () => {
  describe('using Zod', () => {
    it.each([
      {
        input: '1',
        expected: true,
      },
      {
        input: '1.0',
        expected: true,
      },
      {
        input: '100000.000000000',
        expected: true,
      },
      {
        input: '-1',
        expected: true,
      },
      {
        input: '-1.0',
        expected: true,
      },
      {
        input: '-100000.00000000',
        expected: true,
      },
      {
        input: 'hello',
        expected: false,
      },
      {
        input: '123.456abc',
        expected: false,
      },
    ])(
      'Zod should return $expected when checking $input',
      ({ input, expected }) => {
        expect(isValidFloatingPointNumberZod(input)).toBe(expected);
      },
    );

    it.fails.each([
      {
        input: ' 20',
        expected: false,
      },
      {
        input: '20 ',
        expected: false,
      },
      {
        input: '020',
        expected: false,
      },
      {
        input: '20e5',
        expected: false,
      },
      {
        input: '0xA',
        expected: false,
      },
      {
        input: 'Infinity',
        expected: false,
      },
      {
        input: '-Infinity',
        expected: false,
      },
    ])(
      'Zod fails to return $expected when checking $input',
      ({ input, expected }) => {
        expect(isValidFloatingPointNumberZod(input)).toBe(expected);
      },
    );
  });

  describe('using Number()', () => {
    it.each([
      {
        input: '1',
        expected: true,
      },
      {
        input: '1.0',
        expected: true,
      },
      {
        input: '100000.000000000',
        expected: true,
      },
      {
        input: '-1',
        expected: true,
      },
      {
        input: '-1.0',
        expected: true,
      },
      {
        input: '-100000.00000000',
        expected: true,
      },
      {
        input: 'hello',
        expected: false,
      },
      {
        input: '123.456abc',
        expected: false,
      },
    ])(
      'Number() should return $expected when checking $input',
      ({ input, expected }) => {
        expect(isValidFloatingPointNumberWithNumber(input)).toBe(expected);
      },
    );

    it.fails.each([
      {
        input: ' 20',
        expected: false,
      },
      {
        input: '20 ',
        expected: false,
      },
      {
        input: '020',
        expected: false,
      },
      {
        input: '20e5',
        expected: false,
      },
      {
        input: '0xA',
        expected: false,
      },
      {
        input: 'Infinity',
        expected: false,
      },
      {
        input: '-Infinity',
        expected: false,
      },
    ])(
      'Number() fails to return $expected when checking $input',
      ({ input, expected }) => {
        expect(isValidFloatingPointNumberWithNumber(input)).toBe(expected);
      },
    );
  });

  describe('using regex', () => {
    it.each([
      {
        input: '1',
        expected: true,
      },
      {
        input: '1.0',
        expected: true,
      },
      {
        input: '100000.000000000',
        expected: true,
      },
      {
        input: '-1',
        expected: true,
      },
      {
        input: '-1.0',
        expected: true,
      },
      {
        input: '-100000.00000000',
        expected: true,
      },
      {
        input: 'hello',
        expected: false,
      },
      {
        input: '123.456abc',
        expected: false,
      },
      {
        input: ' 20',
        expected: false,
      },
      {
        input: '20 ',
        expected: false,
      },
      {
        input: '020',
        expected: false,
      },
      {
        input: '20e5',
        expected: false,
      },
      {
        input: '0xA',
        expected: false,
      },
      {
        input: 'Infinity',
        expected: false,
      },
      {
        input: '-Infinity',
        expected: false,
      },
      {
        input: '0',
        expected: true,
      },
      {
        input: '0.0',
        expected: true,
      },
      {
        input: '0.000000000',
        expected: true,
      },
      {
        input: '00.0',
        expected: false,
      },
    ])(
      'regex should return $expected when checking $input',
      ({ input, expected }) => {
        expect(isValidFloatingPointNumberRegex(input)).toBe(expected);
      },
    );
  });
});
