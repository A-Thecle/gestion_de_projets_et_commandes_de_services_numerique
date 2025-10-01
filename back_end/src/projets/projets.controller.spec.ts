import { Test, TestingModule } from '@nestjs/testing';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';

describe('ProjetsController', () => {
  let controller: ProjetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjetsController],
      providers: [ProjetsService],
    }).compile();

    controller = module.get<ProjetsController>(ProjetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
