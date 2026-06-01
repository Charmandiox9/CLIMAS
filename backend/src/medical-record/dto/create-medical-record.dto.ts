import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Notas clinicas',
    example: 'El paciente presenta dolor de cabeza',
  })
  @IsNotEmpty()
  @IsString()
  clinicalNotes: string;

  @ApiProperty({
    description: 'Recetas',
    example: 'Paracetamol 500mg cada 8 horas',
    required: false,
  })
  @IsOptional()
  @IsString()
  prescription?: string;

  @ApiProperty({
    description: 'Diagnostico',
    example: 'Migraña',
    required: false,
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({
    description: 'ID de la consulta',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsString()
  consultationId: string;
}
