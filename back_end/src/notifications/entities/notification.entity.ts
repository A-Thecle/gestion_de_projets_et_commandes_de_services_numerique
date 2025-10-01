import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ name: 'notification_id' })
  id!: number;

 @Column()
  message!: string;

  @Column()
  type!: string;

  @Column({ default: false })
  isRead!: boolean;
 
  @ManyToOne(() => Utilisateur, utilisateur => utilisateur.notifications, { onDelete: 'CASCADE' })
 @JoinColumn({ name: 'utilisateurId', referencedColumnName: 'id' }) // <-- ici
  utilisateur!: Utilisateur;


  @CreateDateColumn()
  createdAt!: Date;
}
