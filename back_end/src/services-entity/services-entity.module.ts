import { Module } from '@nestjs/common';
import { ServicesEntityService } from './services-entity.service';
import { ServicesEntityController } from './services-entity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesEntity } from './entities/services-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicesEntity])],
  controllers: [ServicesEntityController],
  providers: [ServicesEntityService],
})
export class ServicesEntityModule {}
