import { z } from 'zod';

export type ProfileDataSource = {
  getProfile: (input: {
    profileId: string;
    bearerToken: string;
  }) => Promise<Profile | null>;
  createProfile: (input: {
    name: string;
    bearerToken: string;
  }) => Promise<Profile>;
  sendProfileCreatedTrackingEvent: (profileId: string) => Promise<void>;
};

export const ProfileSchema = z.object({
  profileId: z.string(),
  name: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;
