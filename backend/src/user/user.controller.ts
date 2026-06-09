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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo usuario (ADMIN/General)',
    description: `Crea un usuario genérico en el sistema.

**Nota:** Este endpoint **NO** crea automáticamente el perfil de \`Doctor\` ni \`Patient\`. Si deseas registrar un Doctor o un Paciente completo, usa los endpoints específicos:
- \`POST /user/doctor\`
- \`POST /user/patient\`

**Roles permitidos**: ADMIN.
    `
  })
  @ApiCreatedResponse({
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
  @ApiBadRequestResponse({
    description: 'Datos inválidos o el RUT/Email ya existe en la base de datos.',
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
  @ApiOperation({ 
    summary: 'Crear un nuevo doctor',
    description: `Crea de forma atómica un **Usuario** y su perfil de **Doctor** asociado.

### Detalles importantes:
- Debes enviar el \`areaId\` real de un área existente.
- Retorna la información completa, incluyendo el \`id\` del registro \`Doctor\` (este es el que se usa luego para crear \`Consultations\`).

**Roles permitidos**: ADMIN.`
  })
  @ApiCreatedResponse({
    description: 'Usuario y perfil de Doctor creados exitosamente.',
    schema: {
      example: {
        id: 'user-uuid',
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
  @ApiBadRequestResponse({
    description: 'Datos inválidos o el RUT/Email ya existe.',
    schema: {
      example: {
        statusCode: 400,
        message: 'El RUT ya existe',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno. Posiblemente el \`areaId\` no exista en la tabla Area.',
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
  @ApiOperation({ 
    summary: 'Crear un nuevo paciente',
    description: `Crea de forma atómica un **Usuario** y su perfil de **Patient** asociado.

### Retorno:
Se devolverá el \`id\` principal del Usuario, pero también el sub-objeto \`patient\`. El \`id\` dentro de \`patient\` es el que debes usar para registrar **Consultas Médicas**.

**Roles permitidos**: ADMIN.`
  })
  @ApiCreatedResponse({
    description: 'Usuario y perfil de Paciente creados exitosamente.',
    schema: {
      example: {
        id: 'user-uuid',
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
  @ApiBadRequestResponse({
    description: 'Datos inválidos o RUT/Email ya existe.',
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
  @ApiOperation({ 
    summary: 'Obtener todos los doctores',
    description: `Retorna la lista de todos los usuarios que tienen el rol de **DOCTOR**.

Útil para poblar selects en el frontend cuando se va a agendar una consulta. 
**Recuerda**: Usa el \`doctor.id\` devuelto en esta lista para las consultas, no el \`id\` del nivel superior (que es el del User).`
  })
  @ApiOkResponse({
    description: 'Lista de doctores obtenida exitosamente.',
    schema: {
      example: [
        {
          id: 'user-uuid',
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
  // Endpoint público: No requiere Auth ni roles
  getDoctors() {
    return this.userService.getDoctors();
  }

  @Get('patients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener todos los pacientes',
    description: `Retorna la lista de todos los usuarios con rol de **PATIENT**.

Útil para agendar consultas o buscar pacientes.
**Recuerda**: Extrae el \`patient.id\` del objeto devuelto para vincular consultas, no el \`id\` superior.`
  })
  @ApiOkResponse({
    description: 'Lista de pacientes obtenida exitosamente.',
    schema: {
      example: [
        {
          id: 'user-uuid',
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
