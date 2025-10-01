export class CreerMessageDto {
  contenu!: string;
  id_projet!: string; // Pour lier au projet
  id_destinataire!: number; // ID de l'admin ou du client
}