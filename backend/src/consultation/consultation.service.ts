import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    const { serviceIds, ...consultationData } = createConsultationDto;
    const data = await this.prisma.consultation.create({
      data: {
        ...consultationData,
        services: serviceIds ? {
          connect: serviceIds.map(id => ({ id })),
        } : undefined,
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
        medicalRecord: true,
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
        services: serviceIds ? {
          set: serviceIds.map(sid => ({ id: sid })),
        } : undefined,
      },
      select: {
        id: true,
        dateTime: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.consultation.delete({
      where: { id },
    });
  }
}

