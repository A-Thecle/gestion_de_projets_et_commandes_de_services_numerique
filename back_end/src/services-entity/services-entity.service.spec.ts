import { Test, TestingModule } from '@nestjs/testing';
import { ServicesEntityService } from './services-entity.service';

describe('ServicesEntityService', () => {
  let service: ServicesEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesEntityService],
    }).compile();

    service = module.get<ServicesEntityService>(ServicesEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
