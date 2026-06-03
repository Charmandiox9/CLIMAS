import { Test, TestingModule } from '@nestjs/testing';
import { AreaService } from './area.service';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('AreaService', () => {
  let service: AreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [AreaService],
    }).compile();

    service = module.get<AreaService>(AreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

