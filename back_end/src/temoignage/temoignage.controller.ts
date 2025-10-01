import { Controller, Post, Body, Get, Param, Req, UseGuards, Patch, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TemoignagesService } from './temoignage.service';
import { CreateTemoignageDto } from './dto/create-temoignage.dto';

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly service: TemoignagesService) {}

 @UseGuards(AuthGuard('jwt'))
@Post()
async createTemoignage(@Req() req: any, @Body() dto: CreateTemoignageDto) {
  return this.service.create({
    ...dto,
    id_client: req.user.id,
  });
}


   @Get('search')
    searchTemoignages(@Query('term') term: string) {
      return this.service.searchTemoignages(term ?? '');
    }

  @Get('projet/:id')
  findByProjet(@Param('id') projetId: string) {
    return this.service.findByProjet(projetId);
  }

 
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/status')
updateStatus(@Param('id') id: number, @Body('statut') statut: 'publié' | 'refusé') {
  return this.service.updateStatus(id, statut);
}

  @Get('publies')
  findPublished() {
    return this.service.findPublished();
  }
}
