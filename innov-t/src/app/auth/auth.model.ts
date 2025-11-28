export interface Utilisateur {
   id :number;

    nom : string;

    prenom : string;

    email : string;

    mot_de_passe : string;

    telephone : number;

    role: 'admin' | 'client';



}