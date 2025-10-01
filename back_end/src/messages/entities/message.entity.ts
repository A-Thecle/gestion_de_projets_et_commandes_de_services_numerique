import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';
import { Projet } from 'src/projets/entities/projet.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id_message!: string;

  @Column({ nullable: true })
  contenu!: string;

  @ManyToOne(() => Utilisateur, (user) => user.messages_envoyes, { eager: true })
  @JoinColumn({ name: 'expediteur_id' }) // 👈 clé étrangère explicite
  expediteur!: Utilisateur;

  @ManyToOne(() => Utilisateur, (user) => user.messages_recus, { eager: true })
  @JoinColumn({ name: 'destinataire_id' }) // 👈 clé étrangère explicite
  destinataire!: Utilisateur;
  
  @ManyToOne(() => Projet, (projet) => projet.messages, {
  eager: true,
  onDelete: 'CASCADE',
})
@JoinColumn({ name: 'projet_id' })
projet!: Projet;


  @CreateDateColumn()
  date_creation!: Date;

  @Column({ default: false })
  est_lu!: boolean;

  @Column({ nullable: true })
typeFichier?: string; 

  @Column({ nullable: true })
fichier?: string; // chemin du fichier (image, PDF, Word, etc.)

@Column({ nullable: true })
nomOriginalFichier?: string; // ex: 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

}
