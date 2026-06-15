import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicalRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const data = await this.prisma.medicalRecord.create({
      data: createMedicalRecordDto,
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });
    return data;
  }

  async findAll() {
    const data = await this.prisma.medicalRecord.findMany({
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay registros médicos');
    }

    return data;
  }

  async findOne(id: string) {
    const data = await this.prisma.medicalRecord.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });

    if (!data) {
      throw new BadRequestException('No hay registro médico con este ID');
    }

    return data;
  }

  async findByPatientId(patientId: string) {
    const user = await this.prisma.patient.findUnique({
      where: {
        userId: patientId,
      },
    });

    if (!user) {
      throw new BadRequestException('No hay usuario con este ID');
    }

    const data = await this.prisma.medicalRecord.findMany({
      where: {
        consultation: {
          patientId,
        },
      },
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay registros médicos');
    }

    return data;
  }

  async findByDoctorId(doctorId: string) {
    const user = await this.prisma.doctor.findUnique({
      where: {
        userId: doctorId,
      },
    });

    if (!user) {
      throw new BadRequestException('No hay usuario con este ID');
    }

    const data = await this.prisma.medicalRecord.findMany({
      where: {
        consultation: {
          doctorId,
        },
      },
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay registros médicos');
    }

    return data;
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto) {
    const data = await this.prisma.medicalRecord.update({
      where: {
        id,
      },
      data: updateMedicalRecordDto,
      select: {
        id: true,
        clinicalNotes: true,
        prescription: true,
        diagnosis: true,
        mediaUrls: true,
        consultationId: true,
        createdAt: true,
        updatedAt: true,
        consultation: {
          select: {
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
          },
        },
      },
    });

    if (!data) {
      throw new BadRequestException('No hay registro médico con este ID');
    }

    return data;
  }

  async remove(id: string) {
    const data = await this.prisma.medicalRecord.delete({
      where: {
        id,
      },
    });

    if (!data) {
      throw new BadRequestException('No hay registro médico con este ID');
    }

    return data;
  }
}
