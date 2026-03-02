import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create.notification.dto';
import { JwtAuthuard } from 'src/auth/guards/jwt.auth.gugard';

@Controller('notifications')
@UseGuards(JwtAuthuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}
  @Post()
  create(@Body() dto: CreateNotificationDto, @Req() req) {
    return this.notificationService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.notificationService.findAllForUsers(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(id, req.user.id);
  }
}
