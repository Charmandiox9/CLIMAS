import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
import { ConsultationStatus } from '@prisma/client';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'Fecha y hora de la consulta médica (formato ISO 8601).',
    example: '2026-06-02T10:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  dateTime: Date | string;

  @ApiProperty({
    description: 'Motivo principal de la consulta. Ayuda al doctor a tener contexto previo a la cita.',
    example: 'Dolor de espalda agudo y persistente',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Estado actual de la consulta. Por defecto, al crear una cita nueva el estado es `SCHEDULED`.',
    enum: ConsultationStatus,
    default: ConsultationStatus.SCHEDULED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiProperty({
    description: 'El ID único del doctor. **¡Atención!** Este debe ser el ID de la tabla `Doctor`, **NO** el ID del `User` asociado a ese doctor.',
    example: 'cuid-doctor-123',
  })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'El ID único del paciente. **¡Atención!** Este debe ser el ID de la tabla `Patient`, **NO** el ID del `User` asociado a ese paciente.',
    example: 'cuid-patient-123',
  })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Arreglo de IDs de los servicios a realizar durante la consulta. Debe ser un arreglo simple de strings.',
    example: ['cuid-service-1'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];
}

