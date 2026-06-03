import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ description: 'Nombre del paciente', example: 'Laura' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Apellido del paciente', example: 'Castro' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'RUT del paciente', example: '98765432-1' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'paciente@climas.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña (mínimo 6 caracteres)', example: 'MiPassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Teléfono', example: '+56912345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Fecha de nacimiento en formato ISO 8601', example: '1990-05-20' })
  @IsDateString()
  dob: string;

  @ApiProperty({ description: 'Dirección del paciente', example: 'Av. Siempre Viva 742', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Tipo de sangre', example: 'O+', required: false })
  @IsString()
  @IsOptional()
  bloodType?: string;
}
