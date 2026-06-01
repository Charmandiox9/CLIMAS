import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsBoolean,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nombre del servicio',
    example: 'Consulta Médica',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción del servicio',
    example: 'Evaluación médica general por un profesional',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Precio del servicio',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({
    description: 'Duración del servicio en minutos',
    example: 30,
    required: false,
  })
  @IsInt()
  @IsOptional()
  @IsPositive()
  duration?: number;

  @ApiProperty({
    description: 'ID del área a la que pertenece el servicio',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiProperty({
    description: 'Indica si el servicio está activo',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
