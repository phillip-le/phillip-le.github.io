type User = {
  firstName: string;
  lastName: string;
  age: number;
};

const userWithUnknownKeys: Partial<User> = {
  firstName: 'John',
  lastName: 'Smith',
  // @ts-expect-error
  invalid: 'key',
};
