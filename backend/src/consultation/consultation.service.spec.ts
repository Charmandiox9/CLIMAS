import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationService } from './consultation.service';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('ConsultationService', () => {
  let service: ConsultationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ConsultationService],
    }).compile();

    service = module.get<ConsultationService>(ConsultationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
