export type User = {
  userId: string;
  name: string;
};

export type UserRepository = {
  createUser: (user: User) => Promise<void>;
  getUserById: (userId: string) => Promise<User | null>;
  getUsers: () => Promise<User[]>;
};
