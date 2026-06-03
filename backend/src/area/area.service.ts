import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AreaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAreaDto: CreateAreaDto) {
    const data = await this.prisma.area.create({
      data: createAreaDto,
    });
    
    if (!data) {
      throw new BadRequestException('Error al crear el área');
    }
    
    return data;
  }

  async findAll(isActive: boolean = true) {
    const data = await this.prisma.area.findMany({
      where: {
        isActive,
      },
      include: {
        doctors: true,
        services: true,
      },
    });

    if (!data || data.length === 0) {
      throw new BadRequestException('No hay áreas registradas');
    }

    return data;
  }

  async findOne(id: string) {
    const data = await this.prisma.area.findUnique({
      where: {
        id,
      },
      include: {
        doctors: true,
        services: true,
      },
    });

    if (!data) {
      throw new BadRequestException('No existe área con este ID');
    }

    return data;
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    await this.findOne(id);

    const data = await this.prisma.area.update({
      where: { id },
      data: updateAreaDto,
    });
    
    if (!data) {
      throw new BadRequestException('Error al actualizar el área');
    }
    
    return data;
  }

  async disable(id: string) {
    await this.findOne(id);
    
    const data = await this.prisma.area.update({
      where: { id },
      data: { isActive: false },
    });

    if (!data) {
      throw new BadRequestException('Error al desactivar el área');
    }

    return data;
  }
}

