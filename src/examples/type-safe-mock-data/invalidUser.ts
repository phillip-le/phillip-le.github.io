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

const anotherUserWithUnknownKeys = {
  firstName: 'John',
  lastName: 'Smith',
  // @ts-expect-error
  invalid: 'key',
} satisfies User as Partial<User> as User;

const getFullName = (user: User) => `${user.firstName} ${user.lastName}`;

getFullName(anotherUserWithUnknownKeys);
