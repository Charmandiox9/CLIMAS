import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Medical Record')
@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo registro médico',
    description: `Crea el registro clínico asociado a una consulta médica ya existente.

### 🛑 Importante: Relación 1 a 1
En la base de datos, \`MedicalRecord\` tiene una relación uno a uno con \`Consultation\`. 
**No puedes** crear más de un registro médico para la misma \`consultationId\`. Si lo intentas, recibirás un error interno por violación de clave única (Unique constraint).

**Roles permitidos**: ADMIN, DOCTOR.`
  })
  @ApiCreatedResponse({
    description: 'Registro médico creado exitosamente.',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
        prescription: 'Paracetamol 500mg cada 8 horas.',
        diagnosis: 'Resfriado común',
        consultationId: '12345678-1234-1234-1234-123456789012',
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        consultation: {
          doctor: {
            user: { firstName: 'John', lastName: 'Doe' },
          },
          patient: {
            user: { firstName: 'Jane', lastName: 'Smith' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno. Usualmente ocurre cuando intentas enviar un \`consultationId\` que ya tiene un registro médico asociado o que no existe.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordService.create(createMedicalRecordDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los registros médicos' })
  @ApiResponse({
    status: 200,
    description: 'Registros médicos obtenidos exitosamente',
    schema: {
      example: [
        {
          id: '12345678-1234-1234-1234-123456789012',
          clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
          prescription: 'Paracetamol 500mg cada 8 horas.',
          diagnosis: 'Resfriado común',
          consultationId: '12345678-1234-1234-1234-123456789012',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
          consultation: {
            doctor: {
              user: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            patient: {
              user: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
            },
          },
        },
      ],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.medicalRecordService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un registro médico por ID' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico obtenido exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
        prescription: 'Paracetamol 500mg cada 8 horas.',
        diagnosis: 'Resfriado común',
        consultationId: '12345678-1234-1234-1234-123456789012',
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        consultation: {
          doctor: {
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
          patient: {
            user: {
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  findOne(@Param('id') id: string) {
    return this.medicalRecordService.findOne(id);
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener historial clínico por Paciente (patientId)',
    description: `Devuelve todos los registros médicos asociados a un **paciente específico**.

**Recuerda**: El \`patientId\` que debes enviar aquí es el ID del perfil de paciente (\`patient.id\`), **NO** el \`userId\` del paciente.

**Roles permitidos**: ADMIN, DOCTOR, PATIENT.`
  })
  @ApiResponse({
    status: 200,
    description: 'Registros médicos del paciente obtenidos exitosamente',
    schema: {
      example: [
        {
          id: '12345678-1234-1234-1234-123456789012',
          clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
          prescription: 'Paracetamol 500mg cada 8 horas.',
          diagnosis: 'Resfriado común',
          consultationId: '12345678-1234-1234-1234-123456789012',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
          consultation: {
            doctor: {
              user: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            patient: {
              user: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
            },
          },
        },
      ],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findByPatientId(@Param('patientId') patientId: string) {
    return this.medicalRecordService.findByPatientId(patientId);
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener registros médicos creados por un Doctor (doctorId)',
    description: `Devuelve todos los registros médicos que fueron redactados por un **doctor específico**.

**Recuerda**: El \`doctorId\` que debes enviar aquí es el ID del perfil de doctor (\`doctor.id\`), **NO** el \`userId\` del doctor.

**Roles permitidos**: ADMIN, DOCTOR, PATIENT.`
  })
  @ApiResponse({
    status: 200,
    description: 'Registros médicos del doctor obtenidos exitosamente',
    schema: {
      example: [
        {
          id: '12345678-1234-1234-1234-123456789012',
          clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
          prescription: 'Paracetamol 500mg cada 8 horas.',
          diagnosis: 'Resfriado común',
          consultationId: '12345678-1234-1234-1234-123456789012',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
          consultation: {
            doctor: {
              user: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            patient: {
              user: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
            },
          },
        },
      ],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  findByDoctorId(@Param('doctorId') doctorId: string) {
    return this.medicalRecordService.findByDoctorId(doctorId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un registro médico' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico actualizado exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        clinicalNotes: 'Notas clínicas actualizadas.',
        prescription: 'Nueva receta médica.',
        diagnosis: 'Diagnóstico actualizado',
        consultationId: '12345678-1234-1234-1234-123456789012',
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-02T00:00:00.000Z',
        consultation: {
          doctor: {
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
          patient: {
            user: {
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordService.update(id, updateMedicalRecordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un registro médico' })
  @ApiResponse({
    status: 200,
    description: 'Registro médico eliminado exitosamente',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-123456789012',
        clinicalNotes: 'El paciente presenta dolor de cabeza y fiebre.',
        prescription: 'Paracetamol 500mg cada 8 horas.',
        diagnosis: 'Resfriado común',
        consultationId: '12345678-1234-1234-1234-123456789012',
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.medicalRecordService.remove(id);
  }
}
