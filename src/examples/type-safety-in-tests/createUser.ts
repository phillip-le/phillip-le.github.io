import type { Api } from './api';
import {
  trackUserCreated,
  trackUserCreatedMultipleArgs,
} from './trackUserCreated';

export const createUser = async ({
  userId,
  name,
  api,
}: {
  userId: string;
  name: string;
  api: Api;
}) => {
  await trackUserCreated({
    userId,
    name,
  });

  await trackUserCreatedMultipleArgs(userId, name);

  return {
    userId,
    extra: await api.getHello(),
  };
};
