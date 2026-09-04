import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

type WelcomeEmailJob = {
  userId: number;
  email: string;
  name: string;
};

@Processor('mail')
export class MailProcessor extends WorkerHost {
  async process(job: Job<WelcomeEmailJob>): Promise<void> {
    if (job.name === 'send-welcome-email') {
      const { email, name } = job.data;

      await Promise.resolve();
      console.log(`Sending welcome email to ${name} at ${email}`);

      // Aici, mai tarziu, vom folosi un serviciu real de email.
    }
  }
}
