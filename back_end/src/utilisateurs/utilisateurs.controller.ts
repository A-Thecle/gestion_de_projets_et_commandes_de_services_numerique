// src/utilisateurs/utilisateurs.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { Utilisateur } from './entities/utilisateur.entity';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateursService: UtilisateursService) {}

  // @Post('login') // Commenté pour éviter le conflit avec AuthController
  // async login(@Body() body: { emailOrPhone: string; mot_de_passe: string }) {
  //   const user = await this.utilisateursService.validateUser(body.emailOrPhone, body.mot_de_passe);
  //   return { utilisateur: user, token: 'dummy-token' };
  // }

  @Post()
  createUser(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    return this.utilisateursService.createUser(createUtilisateurDto);
  }

   @Get('search')
  searchClients(@Query('term') term: string) {
    return this.utilisateursService.searchClients(term);
  }

  @Get()
  getAllUser() {
    return this.utilisateursService.getAllUser();
  }

  @Get(':id')
  findOneUser(@Param('id') id: number) {
    return this.utilisateursService.findOneUser(id);
  }

  @Patch(':id')
  updateClient(@Param('id') id: string, @Body() updateUtilisateurDto: UpdateUtilisateurDto) {
    return this.utilisateursService.updateClient(+id, updateUtilisateurDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.utilisateursService.removeUser(+id);
  }

  @Get(':code_utilisateur/fiche')
  async getClientFiche(@Param('code_utilisateur') code_utilisateur: string) {
    return this.utilisateursService.getClientFiche(code_utilisateur);
  }

 
}