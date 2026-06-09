import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(userId: string) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getAllAttendances() {
    return this.prisma.attendance.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, roles: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async markAttendance(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: today },
      },
    });

    const now = new Date();

    if (!record) {
      return this.prisma.attendance.create({
        data: { userId, date: today, entryTime: now },
      });
    }

    if (!record.lunchStartTime) {
      return this.prisma.attendance.update({
        where: { id: record.id },
        data: { lunchStartTime: now },
      });
    }

    if (!record.lunchEndTime) {
      return this.prisma.attendance.update({
        where: { id: record.id },
        data: { lunchEndTime: now },
      });
    }

    if (!record.exitTime) {
      return this.prisma.attendance.update({
        where: { id: record.id },
        data: { exitTime: now },
      });
    }

    throw new BadRequestException(
      'Todas las marcas del día ya han sido registradas.',
    );
  }
}
