import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(createConsultationDto: CreateConsultationDto) {
    const { serviceIds, ...consultationData } = createConsultationDto;
    let data;
    try {
      data = await this.prisma.consultation.create({
        data: {
          ...consultationData,
          services: serviceIds
            ? {
                connect: serviceIds.map((id) => ({ id })),
              }
            : undefined,
        },
        select: {
          id: true,
          dateTime: true,
          reason: true,
          status: true,
          doctorId: true,
          patientId: true,
          createdAt: true,
          updatedAt: true,
          doctor: {
            select: {
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          patient: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          services: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('El ID del doctor o del paciente proporcionado no es válido o no existe. (Asegúrate de usar el ID de Doctor/Patient, no de User)');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Uno o más IDs de los servicios proporcionados no existen.');
      }
      throw error;
    }

    try {
      const dateStr = new Date(data.dateTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
      await this.notificationsService.sendPushToUser(
        data.doctor.userId,
        'Nueva Cita Asignada',
        `Tienes una nueva consulta agendada con ${data.patient.user.firstName} ${data.patient.user.lastName} para el ${dateStr}.`
      );
    } catch (e) {
      console.log('Push notification failed:', e.message);
    }

    return data;
  }

  async findAll() {
    const data = await this.prisma.consultation.findMany({
      select: {
        id: true,
        dateTime: true,
        reason: true,
        status: true,
        doctorId: true,
        patientId: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        services: true,
        medicalRecord: {
          select: {
            clinicalNotes: true,
            prescription: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay consultas registradas');
    }

    return data;
  }

  async findOne(id: string) {
    const data = await this.prisma.consultation.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        dateTime: true,
        reason: true,
        status: true,
        doctorId: true,
        patientId: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        services: true,
        medicalRecord: {
          select: {
            clinicalNotes: true,
            prescription: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!data) {
      throw new BadRequestException('No existe consulta con este ID');
    }

    return data;
  }

  async findByUserId(userId: string) {
    const data = await this.prisma.consultation.findMany({
      where: {
        OR: [
          { doctor: { userId: userId } },
          { patient: { userId: userId } },
          { doctorId: userId },
          { patientId: userId },
        ],
      },
      select: {
        id: true,
        dateTime: true,
        reason: true,
        status: true,
        doctorId: true,
        patientId: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        services: true,
        medicalRecord: {
          select: {
            clinicalNotes: true,
            prescription: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay consultas para este usuario');
    }

    return data;
  }

  async update(id: string, updateConsultationDto: UpdateConsultationDto) {
    const { serviceIds, ...consultationData } = updateConsultationDto;

    await this.findOne(id);

    const data = await this.prisma.consultation.update({
      where: { id },
      data: {
        ...consultationData,
        services: serviceIds
          ? {
              set: serviceIds.map((sid) => ({ id: sid })),
            }
          : undefined,
      },
      select: {
        id: true,
        dateTime: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            userId: true,
          },
        },
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (updateConsultationDto.status) {
      try {
        const statusMap: Record<string, string> = {
          'SCHEDULED': 'Agendada',
          'IN_PROGRESS': 'En progreso',
          'COMPLETED': 'Completada',
          'CANCELED': 'Cancelada',
        };
        const statusEs = statusMap[updateConsultationDto.status as string] || updateConsultationDto.status;
        
        await this.notificationsService.sendPushToUser(
          data.doctor.userId,
          'Actualización de Cita',
          `La consulta con ${data.patient.user.firstName} ${data.patient.user.lastName} ha cambiado a estado: ${statusEs}.`
        );
      } catch (e) {
        console.log('Push notification failed on update:', e.message);
      }
    }

    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.consultation.delete({
      where: { id },
    });
  }
}
