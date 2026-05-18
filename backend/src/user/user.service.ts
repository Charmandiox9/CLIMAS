import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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

    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.prisma.user.create({
      data: userData,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true,
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

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
