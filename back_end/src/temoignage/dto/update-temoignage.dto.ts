import { PartialType } from '@nestjs/mapped-types';
import { CreateTemoignageDto } from './create-temoignage.dto';

export class UpdateTemoignageDto extends PartialType(CreateTemoignageDto) {}
