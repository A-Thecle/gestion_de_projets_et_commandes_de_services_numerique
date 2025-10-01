import { PartialType } from '@nestjs/mapped-types';

import { CreateServicesEntityDto } from './create-services-entity.dto';

export class UpdateServicesEntityDto extends PartialType(CreateServicesEntityDto) {}
