import type { JobApplication, Logger } from './types';

export const getJob = (jobId: string): Promise<{ jobId: string } | null> =>
  Promise.resolve({
    jobId,
  });

export const createJobApplication = ({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}): Promise<JobApplication> =>
  Promise.resolve({
    jobApplicationId: 'job-application-id',
    userId,
    jobId,
  });

export const sendJobApplicationSuccessNotification = ({}: {
  userId: string;
  jobId: string;
}) => Promise.resolve();

export const logger: Logger = {
  error: console.error,
};
