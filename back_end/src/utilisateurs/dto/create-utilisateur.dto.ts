import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUtilisateurDto {
  @IsNotEmpty()
  @IsString()
  nom: string = "";

  @IsNotEmpty()
  @IsString()
  prenom: string = "";

  @IsNotEmpty()
  @IsEmail()
  email: string = "";

  @IsNotEmpty()
  @MinLength(6)
  mot_de_passe: string = "";

  @IsNotEmpty()
  @IsString()
  telephone: string = "";

  @IsOptional()
  @IsEnum(['admin', 'client'])
  role?: 'admin' | 'client';
}
