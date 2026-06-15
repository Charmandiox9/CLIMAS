import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
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
    description: `Programa una nueva cita médica en el sistema.

### 🛑 Importante: Flujo a seguir
Para evitar errores al crear una consulta, asegúrate de:
1. **Obtener Doctor**: Consultar \`GET /doctor\` para obtener el **ID real del doctor** y enviarlo en \`doctorId\`. (No usar el ID de \`User\`).
2. **Obtener Paciente**: Consultar \`GET /patient\` para obtener el **ID real del paciente** y enviarlo en \`patientId\`. (No usar el ID de \`User\`).
3. **Servicios (Opcional)**: Consultar \`GET /service\` para extraer los IDs de los servicios y enviarlos en \`serviceIds\` como un arreglo de strings.

**Roles permitidos**: ADMIN y DOCTOR.` 
  })
  @ApiCreatedResponse({
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
  @ApiBadRequestResponse({ description: 'Datos inválidos (Bad Request). Ej: Formato de fecha incorrecto o serviceIds no es un array.', schema: { example: { statusCode: 400, message: ['dateTime must be a Date instance'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN o DOCTOR.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor. Suele ocurrir por violación de Foreign Key (ej. enviar el ID de un User en lugar del de un Doctor o Paciente).', schema: { example: { statusCode: 500, message: 'Internal server error' } } })
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
    description: `Obtiene el registro histórico completo de todas las consultas médicas del sistema.
    
**Incluye relaciones:** 
- Datos básicos del doctor.
- Datos básicos del paciente.
- Servicios brindados.
- Registro Médico (clinical notes, prescription, diagnosis) asociado.

**Roles permitidos**: ADMIN.` 
  })
  @ApiOkResponse({
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
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiBadRequestResponse({ description: 'No hay consultas registradas.', schema: { example: { statusCode: 400, message: 'No hay consultas registradas' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.consultationService.findAll();
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener consultas por ID de usuario (User ID)', 
    description: `Retorna todas las citas asociadas a un **usuario** en específico. 
    
Este endpoint busca inteligentemente en la base de datos para saber si el usuario participó en la cita médica, **ya sea como Doctor o como Paciente**.

**Roles permitidos**: ADMIN, DOCTOR, PATIENT.` 
  })
  @ApiOkResponse({
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
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiBadRequestResponse({ description: 'No hay consultas para este usuario.', schema: { example: { statusCode: 400, message: 'No hay consultas para este usuario' } } })
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
    description: `Busca y retorna la información completa de una consulta médica en específico.

**Incluye relaciones:**
- Información del doctor y paciente.
- Servicios asociados.
- Notas clínicas y diagnóstico si tiene un MedicalRecord asociado.

**Roles permitidos**: ADMIN, DOCTOR, PATIENT.` 
  })
  @ApiOkResponse({
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
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiBadRequestResponse({ description: 'Consulta no encontrada.', schema: { example: { statusCode: 400, message: 'No existe consulta con este ID', error: 'Bad Request' } } })
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
    description: `Permite re-agendar, cambiar el estado de la cita o modificar el motivo.

### Casos de uso comunes:
- **Cambio de estado**: Puedes pasar el \`status\` a \`COMPLETED\`, \`CANCELED\`, o \`NO_SHOW\`.
- **Re-agendar**: Modificar el \`dateTime\` de la cita.

Solo se deben enviar los campos que se desean modificar (es una actualización parcial).

**Roles permitidos**: ADMIN, DOCTOR.` 
  })
  @ApiOkResponse({
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
  @ApiBadRequestResponse({ description: 'Datos inválidos (Bad Request) o ID de consulta no existe.', schema: { example: { statusCode: 400, message: ['status must be a valid enum value'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN o DOCTOR.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
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
    description: `Borra definitivamente una consulta médica de los registros y sus relaciones. 

**¡Acción destructiva!** Generalmente es mejor cambiar el estado de la consulta a \`CANCELED\` usando el método PATCH.

**Roles permitidos**: ADMIN.` 
  })
  @ApiOkResponse({
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
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiBadRequestResponse({ description: 'Consulta no encontrada.', schema: { example: { statusCode: 400, message: 'No existe consulta con este ID', error: 'Bad Request' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.consultationService.remove(id);
  }
}
