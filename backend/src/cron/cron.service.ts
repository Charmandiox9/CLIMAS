import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Recordatorio de entrada: Lunes a Viernes a las 08:50 AM
  @Cron('50 8 * * 1-5')
  async handleEntryReminder() {
    this.logger.debug('Enviando recordatorios de entrada...');
    await this.notifyAllActiveStaff(
      '¡No olvides marcar tu entrada!',
      'Inicia tu jornada laboral marcando tu asistencia en la aplicación.',
    );
  }

  // Recordatorio de salida a colación: Lunes a Viernes a las 12:50 PM
  @Cron('50 12 * * 1-5')
  async handleLunchStartReminder() {
    this.logger.debug('Enviando recordatorios de inicio de colación...');
    await this.notifyAllActiveStaff(
      'Hora de Colación',
      'Es hora de tomar un descanso. Recuerda marcar tu salida a colación.',
    );
  }

  // Recordatorio de vuelta de colación: Lunes a Viernes a las 13:50 PM
  @Cron('50 13 * * 1-5')
  async handleLunchEndReminder() {
    this.logger.debug('Enviando recordatorios de fin de colación...');
    await this.notifyAllActiveStaff(
      'Fin de Colación',
      '¡Bienvenido de vuelta! No olvides registrar tu regreso en la app.',
    );
  }

  // Recordatorio de salida: Lunes a Viernes a las 18:50 PM
  @Cron('50 18 * * 1-5')
  async handleExitReminder() {
    this.logger.debug('Enviando recordatorios de salida...');
    await this.notifyAllActiveStaff(
      'Fin de Jornada',
      'Estás a punto de terminar tu turno. Recuerda marcar tu salida.',
    );
  }

  private async notifyAllActiveStaff(title: string, body: string) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          roles: { hasSome: ['WORKER', 'DOCTOR', 'ADMIN'] },
          fcmToken: { not: null },
        },
      });

      for (const user of users) {
        if (user.fcmToken) {
          try {
            await this.notificationsService.sendPushToUser(
              user.id,
              title,
              body,
            );
          } catch (e) {
            this.logger.error(
              `Error enviando notificación a ${user.id}: ${e.message}`,
            );
          }
        }
      }
    } catch (e) {
      this.logger.error(`Error al obtener usuarios: ${e.message}`);
    }
  }
}
