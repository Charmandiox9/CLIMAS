import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user_rut = await this.prisma.user.findUnique({
      where: {
        rut: createUserDto.rut,
      },
    });

    if (user_rut) {
      throw new BadRequestException('El RUT ya existe');
    }

    const user_email = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (user_email) {
      throw new BadRequestException('El email ya existe');
    }

    const saltSounds = 10;

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltSounds,
    );

    const { roles, ...rest } = createUserDto;
    const isPatient = roles ? roles.includes(Role.PATIENT) : true;

    return this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        roles: roles ? { set: roles } : undefined,
        ...(isPatient && {
          patient: {
            create: {
              dob: new Date(),
            },
          },
        }),
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const dataToUpdate = { ...updateUserDto };

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: { ...dataToUpdate },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        roles: true,
        isActive: true,
      },
    });
  }
}
