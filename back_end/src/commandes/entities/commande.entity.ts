import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, BeforeInsert, OneToMany } from "typeorm";
import { Utilisateur } from "../../utilisateurs/entities/utilisateur.entity";
import { ServicesEntity } from "../../services-entity/entities/services-entity.entity";
import { Projet } from "../../projets/entities/projet.entity";


export enum StatutCommande {
  EN_ATTENTE = "en_attente",
  ACCEPTEE = "acceptee",
  REFUSEE = "refusee"
}



@Entity('commandes')
export class Commande {
    @PrimaryColumn()
    commandes_id: string = ""; 

    @ManyToOne(() => Utilisateur, utilisateur => utilisateur.commandes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "client_id" })
    client!: Utilisateur;

    @ManyToOne(() => ServicesEntity, service => service.commandes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "service_id" })
    service!: ServicesEntity;

    @Column("text")
    description_besoins: string = "";

    @Column({ nullable: true })
    fichier_joint: string = "";

    @Column({
      type: "enum",
      enum: StatutCommande,
      default: StatutCommande.EN_ATTENTE
    })
    statut_commande: StatutCommande = StatutCommande.EN_ATTENTE;

    @CreateDateColumn()
    date_commande: Date = new Date();

    @Column({ type: "timestamp", nullable: true })
    date_livraison?: Date;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    montant_final?: number;


    @BeforeInsert()
    generateCommandeId() {
      const randomNum = Math.floor(Math.random() * 900 + 100); // ex: CM_537
      this.commandes_id = `CM_${randomNum}`;
    }

    @OneToMany(() => Projet, projet => projet.commande)
      projets?: Projet[];
}
