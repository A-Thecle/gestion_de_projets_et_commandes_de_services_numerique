import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, BeforeInsert , OneToMany} from "typeorm";
import { Commande } from "../../commandes/entities/commande.entity";
import { Message } from "src/messages/entities/message.entity";
import { Temoignage } from "src/temoignage/entities/temoignage.entity";

export enum EtatProjet {
  EN_ATTENTE = "en_attente",
  EN_COURS = "en_cours",
  EN_REVISION = "en_revision",
  TERMINE = "termine"
}

@Entity('projet')
export class Projet {
  @PrimaryColumn()
  projet_id: string = ""; 

  @ManyToOne(() => Commande, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "commande_id" })
  commande!: Commande;

  @Column({ type: "varchar", length: 255 })
  titre_projet: string = "";

  @Column("text")
  description_projet: string = "";

  @Column({
    type: "enum",
    enum: EtatProjet,
    default: EtatProjet.EN_ATTENTE
  })
  etat: EtatProjet = EtatProjet.EN_ATTENTE;

  @Column({ type: "timestamp", nullable: true })
  date_livraison_prevue?: Date;

  @Column({ type: "text", nullable: true })
  documents_partages?: string;

  @CreateDateColumn()
  date_creation: Date = new Date();

  @BeforeInsert()
  generateProjetId() {
    const randomNum = Math.floor(Math.random() * 900 + 100);
    this.projet_id = `PRJ_${randomNum}`;
  }


  @OneToMany(() => Message, (message) => message.projet)
  messages!: Message[];

    @OneToMany(() => Temoignage, (temoignage) => temoignage.projet)
  temoignages!: Temoignage[];
}

