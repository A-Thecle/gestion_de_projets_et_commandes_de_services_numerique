import { Column, Entity, PrimaryGeneratedColumn, OneToMany} from "typeorm";

import { Commande } from "../../commandes/entities/commande.entity";
@Entity("Services")
export class ServicesEntity {
    @PrimaryGeneratedColumn()
    service_id!: number; 

    @OneToMany(() => Commande, commande => commande.service)
    commandes?: Commande[]; // marque optionnel avec ?

    @Column()
    nom_service: string = ""; // valeur par défaut pour TS

    @Column()
    description_service: string = "";

    @Column()
    prix_minimum: number = 0;
}
