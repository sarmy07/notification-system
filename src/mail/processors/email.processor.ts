import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Job } from 'bullmq';
import { NotificationStatus } from 'src/notifications/entities/notification.entity';

@Processor('email-notifications')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly notificationService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.log(
      `Processing job ${job.id} → notification ${job.data.notificationId}`,
    );

    const { noticationId, title, message, to } = job.data;
    try {
      const html = this.mailService.buildEmailTemplate(title, message);
      await this.mailService.sendEmail({ to, subject: title, html });

      await this.notificationService.updateStatus(
        noticationId,
        NotificationStatus.SENT,
      );
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      await this.notificationService.updateStatus(
        noticationId,
        NotificationStatus.FAILED,
      );

      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} failed`);
  }
}
