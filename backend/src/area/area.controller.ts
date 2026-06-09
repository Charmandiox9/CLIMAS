import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Area')
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear una nueva área', 
    description: `Permite crear una nueva especialidad o área médica (ej. Cardiología). 
    
Las áreas agrupan a **Doctores** y **Servicios**. Es decir, antes de poder registrar un Doctor en Cardiología, debe existir el Área "Cardiología".

**Roles permitidos**: ADMIN.` 
  })
  @ApiCreatedResponse({
    description: 'Área creada exitosamente.',
    schema: {
      example: {
        id: 'cuid12345',
        name: 'Cardiología',
        description: 'Área especializada en el corazón',
        isActive: true,
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos o el nombre del Área ya existe.', schema: { example: { statusCode: 400, message: ['name must be a string'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener todas las áreas', 
    description: `Devuelve una lista con todas las áreas médicas del sistema. 
    
Útil para mostrar el menú de especialidades en el que un paciente puede buscar un Doctor o un Servicio.
Puedes filtrar por áreas activas o inactivas enviando el parámetro opcional \`?isActive=true\` o \`false\`.

**Roles permitidos**: ADMIN, DOCTOR, PATIENT.` 
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiOkResponse({
    description: 'Lista de áreas obtenida exitosamente.',
    schema: {
      example: [
        {
          id: 'cuid12345',
          name: 'Cardiología',
          description: 'Área especializada en el corazón',
          isActive: true,
          createdAt: '2026-06-03T10:00:00.000Z',
          updatedAt: '2026-06-03T10:00:00.000Z',
        }
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado. Se requiere Token JWT.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findAll(@Query('isActive') isActive?: string) {
    const isAct = isActive === 'false' ? false : true;
    return this.areaService.findAll(isAct);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener área por ID', 
    description: 'Devuelve la información detallada de una sola área buscando por su ID único.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Área obtenida exitosamente.',
    schema: {
      example: {
        id: 'cuid12345',
        name: 'Cardiología',
        description: 'Área especializada en el corazón',
        isActive: true,
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 404, description: 'Área no encontrada.', schema: { example: { statusCode: 404, message: 'Area not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findOne(@Param('id') id: string) {
    return this.areaService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Actualizar área por ID', 
    description: 'Permite modificar parcialmente los datos de un área existente (como su nombre o descripción). Solo disponible para usuarios con rol ADMIN.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Área actualizada exitosamente.',
    schema: {
      example: {
        id: 'cuid12345',
        name: 'Cardiología Avanzada',
        description: 'Área especializada en el corazón',
        isActive: true,
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos (Bad Request).', schema: { example: { statusCode: 400, message: ['name must be a string'], error: 'Bad Request' } } })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiResponse({ status: 404, description: 'Área no encontrada.', schema: { example: { statusCode: 404, message: 'Area not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(id, updateAreaDto);
  }

  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Desactivar área por ID', 
    description: 'Cambia el estado de un área a inactiva en lugar de borrarla de la base de datos (Soft Delete). Solo disponible para usuarios con rol ADMIN.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Área desactivada exitosamente.',
    schema: {
      example: {
        id: 'cuid12345',
        name: 'Cardiología',
        description: 'Área especializada en el corazón',
        isActive: false,
        createdAt: '2026-06-03T10:00:00.000Z',
        updatedAt: '2026-06-03T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado.', schema: { example: { statusCode: 401, message: 'Unauthorized' } } })
  @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol ADMIN.', schema: { example: { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' } } })
  @ApiResponse({ status: 404, description: 'Área no encontrada.', schema: { example: { statusCode: 404, message: 'Area not found', error: 'Not Found' } } })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  disable(@Param('id') id: string) {
    return this.areaService.disable(id);
  }
}

