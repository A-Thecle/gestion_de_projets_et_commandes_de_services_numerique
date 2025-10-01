import { Test, TestingModule } from '@nestjs/testing';
import { ServicesEntityController } from './services-entity.controller';
import { ServicesEntityService } from './services-entity.service';

describe('ServicesEntityController', () => {
  let controller: ServicesEntityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesEntityController],
      providers: [ServicesEntityService],
    }).compile();

    controller = module.get<ServicesEntityController>(ServicesEntityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
