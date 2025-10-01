import { Test, TestingModule } from '@nestjs/testing';
import { TemoignageService } from './temoignage.service';

describe('TemoignageService', () => {
  let service: TemoignageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemoignageService],
    }).compile();

    service = module.get<TemoignageService>(TemoignageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
