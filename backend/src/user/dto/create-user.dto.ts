import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ example: 'johndoe@climas.com' })
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

  @ApiProperty({ example: ['PATIENT'], enum: Role })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: Role[];
}
