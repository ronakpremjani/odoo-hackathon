export class JobManager {
  private static jobs: Map<string, NodeJS.Timeout> = new Map();

  public static registerJob(name: string, intervalMs: number, task: () => Promise<void> | void): void {
    if (this.jobs.has(name)) {
      this.stopJob(name);
    }

    console.log(`[JobManager] Registering background task: ${name} (Interval: ${intervalMs}ms)`);
    const timer = setInterval(async () => {
      try {
        await task();
      } catch (err) {
        console.error(`[JobManager] Background task ${name} failed:`, err);
      }
    }, intervalMs);

    this.jobs.set(name, timer);
  }

  public static stopJob(name: string): void {
    const timer = this.jobs.get(name);
    if (timer) {
      clearInterval(timer);
      this.jobs.delete(name);
      console.log(`[JobManager] Stopped background task: ${name}`);
    }
  }

  public static stopAll(): void {
    for (const name of this.jobs.keys()) {
      this.stopJob(name);
    }
  }

  public static initialize(): void {
    console.log('[JobManager] Recurring tasks daemon running.');
  }
}
