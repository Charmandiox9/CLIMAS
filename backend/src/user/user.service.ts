import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
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

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async createDoctor(createDoctorDto: CreateDoctorDto) {
    const user_rut = await this.prisma.user.findUnique({
      where: { rut: createDoctorDto.rut },
    });
    if (user_rut) throw new BadRequestException('El RUT ya existe');

    const user_email = await this.prisma.user.findUnique({
      where: { email: createDoctorDto.email },
    });
    if (user_email) throw new BadRequestException('El email ya existe');

    const { areaId, medicalLicense, ...userData } = createDoctorDto;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: { set: [Role.DOCTOR] },
        doctor: {
          create: { areaId, medicalLicense },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        doctor: {
          select: {
            id: true,
            medicalLicense: true,
            area: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async createPatient(createPatientDto: CreatePatientDto) {
    const user_rut = await this.prisma.user.findUnique({
      where: { rut: createPatientDto.rut },
    });
    if (user_rut) throw new BadRequestException('El RUT ya existe');

    const user_email = await this.prisma.user.findUnique({
      where: { email: createPatientDto.email },
    });
    if (user_email) throw new BadRequestException('El email ya existe');

    const { dob, address, bloodType, ...userData } = createPatientDto;
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: { set: [Role.PATIENT] },
        patient: {
          create: { dob: new Date(dob), address, bloodType },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        patient: {
          select: {
            id: true,
            dob: true,
            address: true,
            bloodType: true,
          },
        },
      },
    });
  }

  getDoctors() {
    return this.prisma.user.findMany({
      where: { roles: { has: Role.DOCTOR } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        doctor: {
          select: {
            id: true,
            medicalLicense: true,
            area: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  getPatients() {
    return this.prisma.user.findMany({
      where: { roles: { has: Role.PATIENT } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rut: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        patient: {
          select: {
            id: true,
            dob: true,
            address: true,
            bloodType: true,
          },
        },
      },
    });
  }

  async disableUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
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

  async updateFcmToken(id: string, fcmToken: string) {
    return this.prisma.user.update({
      where: { id },
      data: { fcmToken },
      select: { id: true, fcmToken: true },
    });
  }
}
