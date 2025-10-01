import { Controller, Get, Post, Body, Param, UseGuards, Req, UnauthorizedException, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreerMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { Request, Response } from 'express'; 
import { extname, join } from 'path'; 


type AuthRequest = Request & { user?: { id?: number } };

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  
  @Get('download/:filename')
downloadFile(@Param('filename') filename: string, @Res() res: Response) {
  const filePath = join(process.cwd(), 'uploads', filename);
  res.download(filePath, filename); // <-- ça force le téléchargement
}

  // 🔹 Route pour envoyer un message avec fichier optionnel
  @Post()
  @UseInterceptors(FileInterceptor('fichier', {
    storage: diskStorage({
      destination: './uploads', // dossier pour stocker les fichiers
     filename: (req, file, cb) => {
  const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'); // Nettoyer le nom original pour éviter les caractères spéciaux
  const extension = extname(file.originalname);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, `${originalName}-${uniqueSuffix}${extension}`); // Ex : document.pdf -> document-1757590330241-434878957.pdf
}
    }),
    fileFilter: (req, file, cb) => {
      // autoriser seulement images et documents
      if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé'), false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // max 10 Mo
  }))
  async envoyer(@Req() req: AuthRequest, @Body() dto: CreerMessageDto, @UploadedFile() fichier?: Express.Multer.File) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    console.log('Envoi message, userId:', userId, 'DTO:', dto, 'Fichier:', fichier?.originalname);
    return this.messagesService.envoyerMessage(userId, dto, fichier);
  }



  // 🔹 Les autres routes restent inchangées
  @Get('projet/:idProjet')
  async obtenirPourProjet(@Param('idProjet') idProjet: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.messagesService.obtenirMessagesPourProjet(idProjet, userId);
  }

  @Post(':id/lu')
  async marquerLu(@Param('id') id: string) {
    return this.messagesService.marquerCommeLu(id);
  }

  @Get('non-lus')
  async obtenirNonLus(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return { compte: await this.messagesService.obtenirNombreNonLus(userId) };
  }

  @Post('projet/:idProjet/lu')
  async marquerTousMessagesProjetCommeLu(@Param('idProjet') idProjet: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    await this.messagesService.marquerTousCommeLu(idProjet, userId);
    return { message: 'Tous les messages du projet marqués comme lus' };
  }

  @Get('non-lus/projets')
  async obtenirNonLusParProjet(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return await this.messagesService.obtenirNombreNonLusParProjet(userId);
  }
}
