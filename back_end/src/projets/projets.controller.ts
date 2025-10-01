import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { Projet } from './entities/projet.entity';
import { EtatProjet } from './entities/projet.entity';

@Controller('projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  
   @Get('search')
    searchCommandes(@Query('term') term: string) {
      return this.projetsService.searchProjets(term ?? '');
    }

    
  @Get('projetEncours')
  countProjetsEnCours() {
    return this.projetsService.countProjetsEnCours();
  }

   @Get('projetTermine')
  countProjetsTermines() {
    return this.projetsService.countProjetsTermines();
  }

  @Post('from-commande/:commande_id')
  createProjetFromCommande(@Param('commande_id') commande_id: string): Promise<Projet> {
    return this.projetsService.createProjetFromCommande(commande_id);
  }

  @Get()
  findAllProject() {
    return this.projetsService.findAllProject();
  }

  @Get(':id')
  findOneProject(@Param('id') id: string) {
    return this.projetsService.findOneProject(id);
  }

  @Patch(':id')
  updateProject(@Param('id') id: string, @Body() updateProjetDto: UpdateProjetDto) {
    return this.projetsService.updateProject(id, updateProjetDto);
  }

  
  @Delete(':id')
  removeProject(@Param('id') id: string) {
    return this.projetsService.removeProject(id);
  }


  @Get('client/:clientId')
  findProjetsByClient(@Param('clientId') clientId: Number): Promise<Projet[]> {
    return this.projetsService.findProjetsByClient(clientId);
  }


 
}