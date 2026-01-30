/**
 * Global job storage for managing video processing jobs across all routes
 * This ensures all routes share the same job state
 */

export interface ProcessingJob {
  job_id: string;
  video_path: string;
  audio_path?: string;
  subtitles?: any[];
  translated_subtitles?: any[];
  quality_report?: any;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  created_at: string;
  error?: string;
}

class JobStorage {
  private jobs: Map<string, ProcessingJob> = new Map();

  /**
   * Create or update a job
   */
  setJob(jobId: string, job: Partial<ProcessingJob>) {
    const existing = this.jobs.get(jobId);
    const updated = { ...existing, ...job, job_id: jobId };
    this.jobs.set(jobId, updated as ProcessingJob);
    return updated;
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Check if job exists
   */
  hasJob(jobId: string): boolean {
    return this.jobs.has(jobId);
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear all jobs
   */
  clearAll(): void {
    this.jobs.clear();
  }
}

// Export singleton instance
export const jobStorage = new JobStorage();

// For backward compatibility, also export as Record for migrations
export function jobsAsRecord(): Record<string, any> {
  const record: Record<string, any> = {};
  jobStorage.getAllJobs().forEach(job => {
    record[job.job_id] = job;
  });
  return record;
}

export default jobStorage;
