export interface Commande {
  commandes_id?: string;
  description_besoins: string;
  
  fichier_joint?: string;
   statut_commande?: string;
  date_livraison?: string;

  
 
  montant_final? : number;
  mode_paiement?: string;
  client_id: number;
  service_id: number;
}