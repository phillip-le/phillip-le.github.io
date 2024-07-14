import {
  createJobApplication,
  getJob,
  logger,
  sendJobApplicationSuccessNotification,
} from './services';

export const applyForJob = async ({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}) => {
  try {
    const job = await getJob(jobId);
    if (!job) {
      throw new JobNotFoundError();
    }

    const jobApplication = await createJobApplication({ userId, jobId });

    await sendJobApplicationSuccessNotification(jobApplication);

    return jobApplication;
  } catch (error: unknown) {
    if (error instanceof JobNotFoundError) {
      throw error;
    }
    logger.error({
      userId,
      jobId,
      error,
    });
    throw new Error('Failed to apply to job', {
      cause: error,
    });
  }
};

export class JobNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'JobNotFoundError';
  }
}
