import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-to-user')
  @ApiOperation({ summary: 'Send push notification to a specific user' })
  async sendToUser(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data?: Record<string, string>,
  ) {
    await this.notificationsService.sendPushToUser(userId, title, body, data);
    return { success: true, message: 'Push notification initiated' };
  }

  @Post('send-global')
  @ApiOperation({ summary: 'Send push notification to all users' })
  async sendGlobal(
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data?: Record<string, string>,
  ) {
    await this.notificationsService.sendPushToAll(title, body, data);
    return { success: true, message: 'Global push notification initiated' };
  }
}
