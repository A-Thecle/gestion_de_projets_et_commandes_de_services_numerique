import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Utilisateur } from 'src/utilisateurs/entities/utilisateur.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
      @InjectRepository(Utilisateur)
        private userRepo: Repository<Utilisateur>,
  ) {}

  async createNotification(userId: number, message: string, type: string): Promise<Notification> {
    const notification = this.notificationRepo.create({
      message,
      type,
      isRead: false,
      utilisateur: { id: userId }, // 🔹 doit correspondre à l’entité ManyToOne
    });
    return this.notificationRepo.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { utilisateur: { id: userId } },
      relations: ['utilisateur'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.notificationRepo.update(notificationId, { isRead: true });
  }
  async markAsUnread(notificationId: number): Promise<void> {
  await this.notificationRepo.update(notificationId, { isRead: false });
}


  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: { utilisateur: { id: userId }, isRead: false },
    });
  }

  async findAdmins() {
  return this.userRepo.find({ where: { role: 'admin' } });
}


  
}
