import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Daniel' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Durán' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ example: 'daniel@correo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiSuperPassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false, example: '+56912345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: ['PATIENT'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
