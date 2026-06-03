import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Juan',
        lastName: 'Pérez',
        rut: '12345678-9',
        email: 'juan@climas.com',
        phone: '+56912345678',
        roles: ['ADMIN'],
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'RUT o email ya existe',
    schema: {
      example: {
        statusCode: 400,
        message: 'El RUT ya existe',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('doctor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo doctor' })
  @ApiResponse({
    status: 201,
    description: 'Doctor creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'María',
        lastName: 'González',
        rut: '98765432-1',
        email: 'maria@climas.com',
        phone: '+56987654321',
        roles: ['DOCTOR'],
        isActive: true,
        doctor: {
          id: 'doc-uuid',
          medicalLicense: 'LIC-001',
          area: {
            id: 'area-uuid',
            name: 'Cardiología',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'RUT o email ya existe',
    schema: {
      example: {
        statusCode: 400,
        message: 'El RUT ya existe',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.userService.createDoctor(createDoctorDto);
  }

  @Post('patient')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Carlos',
        lastName: 'López',
        rut: '11223344-5',
        email: 'carlos@climas.com',
        phone: '+56911223344',
        roles: ['PATIENT'],
        isActive: true,
        patient: {
          id: 'pat-uuid',
          dob: '1990-05-15T00:00:00.000Z',
          address: 'Av. Principal 123',
          bloodType: 'O+',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'RUT o email ya existe',
    schema: {
      example: {
        statusCode: 400,
        message: 'El RUT ya existe',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.userService.createPatient(createPatientDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'Juan',
          lastName: 'Pérez',
          rut: '12345678-9',
          email: 'juan@climas.com',
          phone: '+56912345678',
          roles: ['ADMIN'],
          isActive: true,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.userService.findAll();
  }

  @Get('doctors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los doctores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de doctores obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'María',
          lastName: 'González',
          rut: '98765432-1',
          email: 'maria@climas.com',
          phone: '+56987654321',
          roles: ['DOCTOR'],
          isActive: true,
          doctor: {
            id: 'doc-uuid',
            medicalLicense: 'LIC-001',
            area: {
              id: 'area-uuid',
              name: 'Cardiología',
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getDoctors() {
    return this.userService.getDoctors();
  }

  @Get('patients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes obtenida exitosamente',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'Carlos',
          lastName: 'López',
          rut: '11223344-5',
          email: 'carlos@climas.com',
          phone: '+56911223344',
          roles: ['PATIENT'],
          isActive: true,
          patient: {
            id: 'pat-uuid',
            dob: '1990-05-15T00:00:00.000Z',
            address: 'Av. Principal 123',
            bloodType: 'O+',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getPatients() {
    return this.userService.getPatients();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Juan',
        lastName: 'Pérez',
        rut: '12345678-9',
        email: 'juan@climas.com',
        phone: '+56912345678',
        roles: ['ADMIN'],
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Juan',
        lastName: 'Pérez',
        rut: '12345678-9',
        email: 'juan@climas.com',
        phone: '+56912345678',
        roles: ['ADMIN'],
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Usuario no encontrado',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Juan',
        lastName: 'Pérez',
        rut: '12345678-9',
        email: 'juan@climas.com',
        phone: '+56912345678',
        roles: ['ADMIN'],
        isActive: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        statusCode: 400,
        message: 'Usuario no encontrado',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  disableUser(@Param('id') id: string) {
    return this.userService.disableUser(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        message: 'Usuario eliminado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no proporcionado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Se requiere rol ADMIN',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
