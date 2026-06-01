import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    const data = this.prisma.service.create({
      data: createServiceDto,
    });
    return data;
  }

  async findAll(isActive: boolean) {
    const data = await this.prisma.service.findMany({
      include: {
        area: true,
        consultations: true,
      },
      where: {
        isActive,
      },
    });

    if (!data) {
      throw new BadRequestException('Error al obtener los servicios');
    }

    return data;
  }

  async findOne(id: string) {
    const data = await this.prisma.service.findUnique({
      include: {
        area: true,
        consultations: true,
      },
      where: {
        id,
      },
    });

    if (!data) {
      throw new BadRequestException('Error al obtener el servicio');
    }

    return data;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const data = await this.prisma.service.update({
      include: {
        area: true,
        consultations: true,
      },
      where: {
        id,
      },
      data: updateServiceDto,
    });

    if (!data) {
      throw new BadRequestException('Error al actualizar el servicio');
    }

    return data;
  }

  async disable(id: string) {
    const data = await this.prisma.service.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });

    if (!data) {
      throw new BadRequestException('Error al desactivar el servicio');
    }

    return data;
  }
}
