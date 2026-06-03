import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordService } from 'src/medical-record/medical-record.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('MedicalRecordService', () => {
  let service: MedicalRecordService;

  const mockPrisma = {
    medicalRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    doctor: {
      findUnique: jest.fn(),
    },
  };

  const mockRecord = {
    id: 'record-1',
    clinicalNotes: 'Paciente con fiebre alta',
    prescription: 'Paracetamol 500mg cada 8h',
    diagnosis: 'Gripe estacional',
    consultationId: 'consult-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    consultation: {
      doctor: { user: { firstName: 'Mario', lastName: 'Ruiz' } },
      patient: { user: { firstName: 'Laura', lastName: 'Castro' } },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MedicalRecordService>(MedicalRecordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear y retornar un registro médico', async () => {
      mockPrisma.medicalRecord.create.mockResolvedValue(mockRecord);

      const dto = {
        clinicalNotes: 'Paciente con fiebre alta',
        consultationId: 'consult-1',
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockRecord);
      expect(result.clinicalNotes).toBe('Paciente con fiebre alta');
      expect(mockPrisma.medicalRecord.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los registros médicos', async () => {
      mockPrisma.medicalRecord.findMany.mockResolvedValue([mockRecord]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('record-1');
    });

    it('debe lanzar BadRequestException si no hay registros', async () => {
      mockPrisma.medicalRecord.findMany.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(
        new BadRequestException('No hay registros médicos'),
      );
    });
  });

  describe('findOne', () => {
    it('debe retornar un registro médico por id', async () => {
      mockPrisma.medicalRecord.findUnique.mockResolvedValue(mockRecord);

      const result = await service.findOne('record-1');

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.medicalRecord.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'record-1' } }),
      );
    });

    it('debe lanzar BadRequestException si el registro no existe', async () => {
      mockPrisma.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.findOne('id-invalido')).rejects.toThrow(
        new BadRequestException('No hay registro médico con este ID'),
      );
    });
  });

  describe('findByPatientId', () => {
    it('debe lanzar BadRequestException si el paciente no existe', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      await expect(service.findByPatientId('paciente-invalido')).rejects.toThrow(
        new BadRequestException('No hay usuario con este ID'),
      );
    });

    it('debe retornar los registros del paciente cuando existe', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ userId: 'patient-1' });
      mockPrisma.medicalRecord.findMany.mockResolvedValue([mockRecord]);

      const result = await service.findByPatientId('patient-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('record-1');
    });

    it('debe lanzar BadRequestException si el paciente no tiene registros', async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ userId: 'patient-1' });
      mockPrisma.medicalRecord.findMany.mockResolvedValue([]);

      await expect(service.findByPatientId('patient-1')).rejects.toThrow(
        new BadRequestException('No hay registros médicos'),
      );
    });
  });

  describe('findByDoctorId', () => {
    it('debe lanzar BadRequestException si el doctor no existe', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.findByDoctorId('doctor-invalido')).rejects.toThrow(
        new BadRequestException('No hay usuario con este ID'),
      );
    });

    it('debe retornar los registros del doctor cuando existe', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue({ userId: 'doctor-1' });
      mockPrisma.medicalRecord.findMany.mockResolvedValue([mockRecord]);

      const result = await service.findByDoctorId('doctor-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('debe actualizar y retornar el registro modificado', async () => {
      const updatedRecord = { ...mockRecord, clinicalNotes: 'Notas actualizadas' };
      mockPrisma.medicalRecord.update.mockResolvedValue(updatedRecord);

      const result = await service.update('record-1', { clinicalNotes: 'Notas actualizadas' });

      expect(result.clinicalNotes).toBe('Notas actualizadas');
      expect(mockPrisma.medicalRecord.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('debe eliminar el registro y retornarlo', async () => {
      mockPrisma.medicalRecord.delete.mockResolvedValue(mockRecord);

      const result = await service.remove('record-1');

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.medicalRecord.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'record-1' } }),
      );
    });
  });
});
