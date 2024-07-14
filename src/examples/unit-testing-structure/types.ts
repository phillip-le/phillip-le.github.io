export type Logger = {
  error: (data: Record<string, unknown>) => void;
};

export type JobApplication = {
  jobApplicationId: string;
  userId: string;
  jobId: string;
};
