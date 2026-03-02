import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { UsersModule } from 'src/users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { EmailProcessor } from 'src/mail/processors/email.processor';
import { MailModule } from 'src/mail/mail.module';
import { NotificationGateway } from './gateway/notification.gatway';
import { InAppProcessor } from './processors/inapp.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    BullModule.registerQueue(
      {
        name: 'email-notifications',
      },
      {
        name: 'inApp-notifications',
      },
    ),
    UsersModule,
    MailModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailProcessor,
    NotificationGateway,
    InAppProcessor,
  ],
  exports: [TypeOrmModule],
})
export class NotificationsModule {}
