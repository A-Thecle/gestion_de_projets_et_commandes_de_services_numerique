export interface Projet {
  projet_id: string;
  titre_projet: string;
  description_projet: string;
  etat: string;
  date_livraison_prevue: Date;
  documents_partages?: string[]; 
  commande?: {
    commandes_id: string;
    description_besoins: string;
    fichier_joint?: string;
    statut_commande: string;
    date_commande: Date;
    date_livraison?: Date;
    montant_final?: number;
    client: {
      id: string;
      nom: string;
      prenom: string;
      
    };
    service: {
      service_id: string;
      nom_service: string;
    };
  };
}
