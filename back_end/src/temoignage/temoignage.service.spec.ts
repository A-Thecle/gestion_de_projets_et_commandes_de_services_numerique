import { Test, TestingModule } from '@nestjs/testing';
import { TemoignagesService } from './temoignage.service';

describe('TemoignageService', () => {
  let service: TemoignagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemoignagesService],
    }).compile();

    service = module.get<TemoignagesService>(TemoignagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
