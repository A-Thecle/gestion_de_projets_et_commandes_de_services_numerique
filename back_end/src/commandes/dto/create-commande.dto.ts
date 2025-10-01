import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { StatutCommande} from '../entities/commande.entity';

export class CreateCommandeDto {
  @IsNotEmpty()
  @IsNumber()
  client_id: number = 0;

  @IsNotEmpty()
  @IsNumber()
  service_id: number = 0;

  @IsNotEmpty()
  @IsString()
  description_besoins: string = "";

  @IsOptional()
  @IsString()
  fichier_joint?: string;

  @IsOptional()
  @IsEnum(StatutCommande)
  statut_commande?: StatutCommande = StatutCommande.EN_ATTENTE;

  @IsOptional()
  date_livraison?: Date;

  @IsOptional()
  @IsNumber()
  montant_final?: number;

}
