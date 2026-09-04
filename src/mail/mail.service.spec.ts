import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  const mailQueue = {
    add: jest.fn(),
  };

  beforeEach(() => {
    mailQueue.add.mockReset();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail'),
          useValue: mailQueue,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('adds a welcome email job to the mail queue', async () => {
    await service.sendWelcomeEmail({
      userId: 1,
      email: 'user@example.com',
      name: 'Test User',
    });

    expect(mailQueue.add).toHaveBeenCalledWith(
      'send-welcome-email',
      {
        userId: 1,
        email: 'user@example.com',
        name: 'Test User',
      },
      expect.objectContaining({
        jobId: 'welcome-email:1',
        attempts: 5,
      }),
    );
  });
});
