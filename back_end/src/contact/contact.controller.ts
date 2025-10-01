import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {
  @Post()
  async sendMail(@Body() body: { email: string; objet: string; message: string }) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Utiliser STARTTLS
        auth: {
          user: 'natharamanampamonjy94@gmail.com',
          pass: 'swhdetqbkqzosapf'
        },
      });

      // Vérifier la connexion SMTP
      await new Promise<void>((resolve, reject) => {
  transporter.verify((error: Error | null, success: boolean) => {
    if (error) {
      console.error('Erreur de connexion SMTP:', error);
      reject(error);
    } else {
      console.log('Connexion SMTP réussie');
      resolve();
    }
  });
});


      await transporter.sendMail({
        from: '"Votre Nom" <natharamanampamonjy94@gmail.com>',
        replyTo: body.email,
        to: 'natharamanampamonjy94@gmail.com',
        subject: body.objet,
        text: body.message,
      });

      return { success: true, message: 'Email envoyé avec succès ✅' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new HttpException(
        'Erreur lors de l\'envoi de l\'email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}