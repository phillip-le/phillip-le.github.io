// biome-ignore lint/correctness/noEmptyPattern: dummy function
export const trackUserCreated = ({}: { userId: string; name: string }) =>
  Promise.resolve();

export const trackUserCreatedMultipleArgs = (_userId: string, _name: string) =>
  Promise.resolve();
