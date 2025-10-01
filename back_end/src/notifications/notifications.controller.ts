import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(Number(userId));
  }

  @Get(':userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string): Promise<number> {
    return this.notificationService.getUnreadCount(Number(userId));
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<void> {
    return this.notificationService.markAsRead(Number(id));
  }
}
