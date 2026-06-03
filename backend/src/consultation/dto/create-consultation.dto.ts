import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
import { ConsultationStatus } from '@prisma/client';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'Fecha y hora de la consulta',
    example: '2026-06-02T10:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  dateTime: Date | string;

  @ApiProperty({
    description: 'Motivo de la consulta',
    example: 'Dolor de espalda',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Estado de la consulta',
    enum: ConsultationStatus,
    default: ConsultationStatus.SCHEDULED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiProperty({
    description: 'ID del doctor',
    example: 'cuid-doctor-123',
  })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: 'cuid-patient-123',
  })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Lista de IDs de servicios',
    example: ['cuid-service-1'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];
}

