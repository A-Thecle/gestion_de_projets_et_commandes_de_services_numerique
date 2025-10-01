import { Test, TestingModule } from '@nestjs/testing';
import { TemoignageController } from './temoignage.controller';
import { TemoignageService } from './temoignage.service';

describe('TemoignageController', () => {
  let controller: TemoignageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemoignageController],
      providers: [TemoignageService],
    }).compile();

    controller = module.get<TemoignageController>(TemoignageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
