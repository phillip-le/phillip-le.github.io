import { trackUserCreated, trackUserCreatedMultipleArgs } from './trackUserCreated';

export const createUser = async ({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) => {
  await trackUserCreated({
    userId,
    name,
  });

  await trackUserCreatedMultipleArgs(userId, name);

  return {
    userId,
  };
};
