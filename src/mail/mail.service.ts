import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

type WelcomeEmailJob = {
  userId: number;
  email: string;
  name: string;
};

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail')
    private readonly mailQueue: Queue<WelcomeEmailJob>,
  ) {}

  async sendWelcomeEmail(user: WelcomeEmailJob): Promise<void> {
    await this.mailQueue.add(
      'send-welcome-email',
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
      {
        jobId: `welcome-email:${user.userId}`,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 24 * 3600,
        },
      },
    );
  }
}
