import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationGateway } from '../gateway/notification.gatway';
import { NotificationsService } from '../notifications.service';
import { NotificationStatus } from '../entities/notification.entity';

@Processor('inApp-notifications')
export class InAppProcessor extends WorkerHost {
  private readonly logger = new Logger(InAppProcessor.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.log(
      `Processing job ${job.id} -> notification ${job.data.notificationId}`,
    );

    const { notificationId, userId, title, message, to } = job.data;
    try {
      this.notificationGateway.sendNotificationToUser(userId, {
        id: notificationId,
        title,
        message,
        createdAt: new Date(),
      });

      await this.notificationService.updateStatus(
        notificationId,
        NotificationStatus.SENT,
      );
      this.logger.log(`In-app job ${job.id} completed successfully`);
    } catch (error) {
      await this.notificationService.updateStatus(
        notificationId,
        NotificationStatus.FAILED,
      );
      this.logger.error(`In-app job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(` In-app job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`In-app job ${job.id} failed: ${error.message}`);
  }
}
