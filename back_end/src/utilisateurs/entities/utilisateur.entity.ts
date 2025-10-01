import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany} from 'typeorm';

import { Commande } from "../../commandes/entities/commande.entity";
import { Notification } from 'src/notifications/entities/notification.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Temoignage } from 'src/temoignage/entities/temoignage.entity';

@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn()
  id!: number ;

  @Column({ unique: true })
  code_utilisateur: string = "";

  @Column()
  nom: string = "";

  @Column()
  prenom: string = "";

  @Column({ unique: true })
  email: string = "";

  @Column()
  mot_de_passe: string = "";

  @Column()
  telephone: number = 0;

  @Column({ type: 'enum', enum: ['admin', 'client'], default: 'client' })
  role: 'admin' | 'client' = 'client';
  
  @OneToMany(() => Commande, commande => commande.client, { cascade: true, onDelete: 'CASCADE' })
commandes?: Commande[];

@OneToMany(() => Notification, notification => notification.utilisateur, { cascade: true, onDelete: 'CASCADE' })
notifications!: Notification[];

@OneToMany(() => Message, (message) => message.expediteur, { cascade: true, onDelete: 'CASCADE' })
messages_envoyes!: Message[];

@OneToMany(() => Message, (message) => message.destinataire, { cascade: true, onDelete: 'CASCADE' })
messages_recus!: Message[];

@OneToMany(() => Temoignage, (temoignage) => temoignage.client, { cascade: true, onDelete: 'CASCADE' })
temoignages!: Temoignage[];


}
