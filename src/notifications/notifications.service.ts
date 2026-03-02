import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import { CreateNotificationDto } from './dto/create.notification.dto';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @InjectQueue('email-notifications')
    private readonly emailQueue: Queue,
    @InjectQueue('inApp-notifications')
    private readonly inAppQueue: Queue,
    private readonly userService: UsersService,
  ) {}

  async create(dto: CreateNotificationDto, userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException(`User with ${userId} not found`);

    const notification = this.repo.create({
      title: dto.title,
      message: dto.message,
      type: dto.type,
      userId,
      status: NotificationStatus.PENDING,
    });

    const saved = await this.repo.save(notification);
    this.logger.log(
      `Notification with ${saved.id} created with status pending`,
    );

    if (dto.type === NotificationType.EMAIL) {
      if (!user.emailNotifications) {
        this.logger.log(`User ${user.id} has email notifications disabled`);
        return saved;
      }
      await this.emailQueue.add(
        'send-email',
        {
          notificationId: saved.id,
          to: user.email,
          title: saved.title,
          message: saved.message,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
      this.logger.log(`Email job queued for notification ${saved.id}`);
    }

    if (dto.type === NotificationType.IN_APP) {
      if (!user.inAppNotifications) {
        this.logger.log(`User ${user.id} has in-app notifications disabled`);
        return saved;
      }
      await this.inAppQueue.add(
        'send-inApp',
        {
          notificationId: saved.id,
          userId: user.id,
          title: saved.message,
          message: saved.message,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
      this.logger.log(`In-App job queued for notification ${saved.id}`);
    }
    return saved;
  }

  async findAllForUsers(userId: string) {
    return this.repo.find({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.repo.findOne({
      where: {
        id,
      },
    });
    if (!notification) throw new NotFoundException('notification not found');

    if (notification.userId !== userId) {
      throw new UnauthorizedException('you can only update your notication');
    }

    notification.isRead = true;
    return await this.repo.save(notification);
  }

  async updateStatus(notificationId: string, status: NotificationStatus) {
    const notification = await this.repo.findOne({
      where: {
        id: notificationId,
      },
    });
    if (!notification) return false;
    await this.repo.update(notification, { status });
    this.logger.log(
      `Notification ${notificationId} status updated to ${status}`,
    );
  }
}
