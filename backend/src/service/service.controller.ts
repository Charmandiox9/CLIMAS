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
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo servicio',
    description: `Permite a un administrador crear un nuevo servicio médico en el sistema (Ej. "Consultoría Nutricional", "Electrocardiograma").

**Nota**: Se requiere enviar un \`areaId\` válido que relacione este servicio con una especialidad/área del centro médico.`
  })
  @ApiCreatedResponse({
    description: 'Servicio creado exitosamente.',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Consulta de control',
        description: 'Chequeo de rutina',
        price: 100,
        duration: 60,
        areaId: '12345678-1234-1234-1234-123456789012',
        isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener todos los servicios',
    description: `Obtiene el catálogo de servicios ofrecidos. 
    
Útil para mostrarle al Doctor o Administrador las opciones disponibles al momento de **crear una consulta**.
El arreglo devuelto contendrá el \`id\` que se debe usar en el campo \`serviceIds\` de la consulta.`
  })
  @ApiOkResponse({
    description: 'Servicios obtenidos exitosamente.',
    schema: {
      example: [{
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Consultoría Nutricional',
        description: 'Evaluación y orientación nutricional personalizada.',
        price: 100,
        duration: 60,
        areaId: '12345678-1234-1234-1234-123456789012',
        isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        area: {
          id: '12345678-1234-1234-1234-123456789012',
          name: 'Nutrición',
          description: 'Área encargada de la nutrición',
          isActive: true,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        consultations: [],
      }],
    },
  })
  findAll(@Param('isActive') isActive: boolean) {
    return this.serviceService.findAll(isActive);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({
    status: 200,
    description: 'Servicio obtenido exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Consultoría Nutricional',
        description: 'Evaluación y orientación nutricional personalizada.',
        price: 100,
        duration: 60,
        areaId: '12345678-1234-1234-1234-123456789012',
        isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        area: {
          id: '12345678-1234-1234-1234-123456789012',
          name: 'Nutrición',
          description: 'Área encargada de la nutrición',
          isActive: true,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        consultations: [],
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Consultoría Nutricional',
        description: 'Evaluación y orientación nutricional personalizada.',
        price: 100,
        duration: 60,
        areaId: '12345678-1234-1234-1234-123456789012',
        isActive: true,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        area: {
          id: '12345678-1234-1234-1234-123456789012',
          name: 'Nutrición',
          description: 'Área encargada de la nutrición',
          isActive: true,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        consultations: [],
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio desactivado exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Consultoría Nutricional',
        description: 'Evaluación y orientación nutricional personalizada.',
        price: 100,
        duration: 60,
        areaId: '12345678-1234-1234-1234-123456789012',
        isActive: false,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  disable(@Param('id') id: string) {
    return this.serviceService.disable(id);
  }
}
