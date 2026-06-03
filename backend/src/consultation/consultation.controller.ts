import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Consultation')
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear una nueva consulta', 
    description: 'Programa una nueva cita médica. Se requiere vincularla a un Doctor, a un Paciente, y a al menos un Servicio válido. Disponible para ADMIN y DOCTOR.' 
  })
  @ApiResponse({
    status: 201,
    description: 'Consulta creada exitosamente.',
    schema: {
      example: {
        id: 'cuid67890',
        dateTime: '2026-06-10T15:30:00.000Z',
        reason: 'Chequeo general',
        status: 'SCHEDULED',
        doctorId: 'cuid-doc-123',
        patientId: 'cuid-pat-456',
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (Bad Request).', schema: { example: { statusCode: 400, message: ['dateTime must be a Date instance'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN o DOCTOR.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationService.create(createConsultationDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener todas las consultas', 
    description: 'Obtiene el registro histórico completo de todas las consultas médicas del sistema. Solo disponible para usuarios con rol ADMIN.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de consultas obtenida exitosamente.',
    schema: {
      example: [
        {
          id: 'cuid67890',
          dateTime: '2026-06-10T15:30:00.000Z',
          reason: 'Chequeo general',
          status: 'SCHEDULED',
          doctorId: 'cuid-doc-123',
          patientId: 'cuid-pat-456',
          createdAt: '2026-06-03T10:00:00.000Z',
          updatedAt: '2026-06-03T10:00:00.000Z',
        }
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.consultationService.findAll();
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener consultas por ID de usuario', 
    description: 'Retorna todas las citas asociadas a un usuario en específico, sin importar si este actuó como Doctor o como Paciente en dichas citas.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Consultas del usuario obtenidas exitosamente.',
    schema: {
      example: [
        {
          id: 'cuid67890',
          dateTime: '2026-06-10T15:30:00.000Z',
          reason: 'Chequeo general',
          status: 'SCHEDULED',
          doctorId: 'cuid-doc-123',
          patientId: 'cuid-pat-456',
          createdAt: '2026-06-03T10:00:00.000Z',
          updatedAt: '2026-06-03T10:00:00.000Z',
        }
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findByUserId(@Param('userId') userId: string) {
    return this.consultationService.findByUserId(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener consulta por ID', 
    description: 'Busca y retorna la información completa de una consulta específica, incluyendo detalles del doctor, paciente y servicios brindados.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta obtenida exitosamente.',
    schema: {
      example: {
        id: 'cuid67890',
        dateTime: '2026-06-10T15:30:00.000Z',
        reason: 'Chequeo general',
        status: 'SCHEDULED',
        doctorId: 'cuid-doc-123',
        patientId: 'cuid-pat-456',
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada.', schema: { example: { statusCode: 404, message: 'Consultation not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findOne(@Param('id') id: string) {
    return this.consultationService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar consulta por ID', 
    description: 'Permite re-agendar, cambiar el estado (ej. de SCHEDULED a COMPLETED) o modificar el motivo de una cita médica. Disponible para ADMIN y DOCTOR.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta actualizada exitosamente.',
    schema: {
      example: {
        id: 'cuid67890',
        dateTime: '2026-06-10T15:30:00.000Z',
        reason: 'Revisión de exámenes',
        status: 'COMPLETED',
        doctorId: 'cuid-doc-123',
        patientId: 'cuid-pat-456',
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-10T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (Bad Request).', schema: { example: { statusCode: 400, message: ['status must be a valid enum value'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN o DOCTOR.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada.', schema: { example: { statusCode: 404, message: 'Consultation not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  update(@Param('id') id: string, @Body() updateConsultationDto: UpdateConsultationDto) {
    return this.consultationService.update(id, updateConsultationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar consulta por ID', 
    description: 'Borra definitivamente una consulta médica de los registros. Esta acción es destructiva y solo puede ser ejecutada por un ADMIN.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta eliminada exitosamente.',
    schema: {
      example: {
        id: 'cuid67890',
        dateTime: '2026-06-10T15:30:00.000Z',
        reason: 'Chequeo general',
        status: 'SCHEDULED',
        doctorId: 'cuid-doc-123',
        patientId: 'cuid-pat-456',
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiResponse({ status: 404, description: 'Consulta no encontrada.', schema: { example: { statusCode: 404, message: 'Consultation not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.consultationService.remove(id);
  }
}
