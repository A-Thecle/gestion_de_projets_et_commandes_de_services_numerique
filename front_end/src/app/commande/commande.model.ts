export interface Commande {
  commandes_id: string;
  description_besoins: string;
  fichier_joint?: string;
  statut_commande: string;
  date_commande: string;
  date_livraison?: string;
  montant_final?: number;
 
  client: { id: number, code_utilisateur: string , nom: string; prenom: string, email: string , telephone: number}; 
  service: { service_id: string; nom_service: string; description_service: string, prix_estime: number }; 
}
