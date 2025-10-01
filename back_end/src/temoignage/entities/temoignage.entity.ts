import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Utilisateur } from "src/utilisateurs/entities/utilisateur.entity";
import { Projet } from "src/projets/entities/projet.entity";

@Entity('temoignages')
export class Temoignage {
  @PrimaryGeneratedColumn()
  id_temoignage!: number;

  @ManyToOne(() => Utilisateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "id_client" })
  client!: Utilisateur;

  @ManyToOne(() => Projet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "id_projet" })
  projet!: Projet;

  @Column({ type: "int", width: 1 })
  note!: number; // 1 à 5

  @Column("text")
  commentaire!: string;

  @CreateDateColumn()
  date_soumission!: Date;

  @Column({
    type: 'enum',
    enum: ['en_attente', 'publié', 'refusé'],
    default: 'en_attente' // Défaut défini à 'en_attente'
  })
  statut_temoignage!: string;

  
}

