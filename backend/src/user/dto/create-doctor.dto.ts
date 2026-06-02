import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Nombre del doctor', example: 'Mario' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Apellido del doctor', example: 'Ruiz' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'RUT del doctor', example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'doctor@climas.com' })
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

  @ApiProperty({ description: 'ID del área médica a la que pertenece', example: 'cuid-del-area' })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiProperty({ description: 'Número de licencia médica', example: 'LIC-12345', required: false })
  @IsString()
  @IsOptional()
  medicalLicense?: string;
}
