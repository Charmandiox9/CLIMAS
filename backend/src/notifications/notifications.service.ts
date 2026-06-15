import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private initialized = false;

  constructor(private readonly prisma: PrismaService) {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin() {
    try {
      const serviceAccountPath = path.resolve(process.cwd(), 'firebase-adminsdk.json');
      if (fs.existsSync(serviceAccountPath)) {
        initializeApp({
          credential: cert(require(serviceAccountPath)),
        });
        this.initialized = true;
        this.logger.log('Firebase Admin SDK inicializado correctamente.');
      } else {
        this.logger.warn('Archivo firebase-adminsdk.json no encontrado en la raiz del backend. Las notificaciones push no se enviarán hasta agregarlo.');
      }
    } catch (error) {
      this.logger.error('Error al inicializar Firebase Admin SDK', error);
    }
  }

  async sendPushToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.initialized) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user || !user.fcmToken) {
      this.logger.log(`No se pudo enviar push a ${userId} (No tiene fcmToken)`);
      return;
    }

    try {
      const message: Message = {
        notification: { title, body },
        data,
        token: user.fcmToken,
      };

      const response = await getMessaging().send(message);
      this.logger.log(`Push enviado a ${userId}: ${response}`);
    } catch (error) {
      this.logger.error(`Error enviando push a ${userId}:`, error);
    }
  }
}
