import { PartialType } from '@nestjs/mapped-types';
import { CreerMessageDto } from './create-message.dto';


export class UpdateMessageDto extends PartialType( CreerMessageDto) {}
