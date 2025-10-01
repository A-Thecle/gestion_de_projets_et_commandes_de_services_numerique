import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Patch , Query} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { Param, HttpCode } from '@nestjs/common';
import { Commande } from './entities/commande.entity';

@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

   @Get()
  findAllCommande() {
    return this.commandesService.findAllCommande();
  }

   @Get('commandeAttente')
  countCommandesEnAttente() {
    return this.commandesService.countCommandesEnAttente();
  }

  @Post()
  @UseInterceptors(FileInterceptor('fichier_joint', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${file.fieldname}-${randomSuffix}${fileExt}`);
      }
    })
  }))
  createCommande(
    @UploadedFile() fichier_joint: Express.Multer.File,
    @Body() createCommandeDto: CreateCommandeDto
  ) {
    return this.commandesService.createCommande({
      ...createCommandeDto,
      fichier_joint: fichier_joint?.filename // on stocke juste le nom du fichier
    });
  }



  @Post('valider/:id')
  @HttpCode(200)
  validerCommande(@Param('id') id: string) {
    return this.commandesService.validerCommande(id);
  }

  @Patch('refuser/:id')
refuserCommande(@Param('id') id: string) {
  return this.commandesService.refuserCommande(id);
}

 @Get('search')
  searchCommandes(@Query('term') term: string) {
    return this.commandesService.searchCommandes(term ?? '');
  }

   @Get('client/:clientId')
    findCommandesByClient(@Param('clientId') clientId: Number): Promise<Commande[]> {
      return this.commandesService.findCommandesByClient(clientId);
    }

   



}
