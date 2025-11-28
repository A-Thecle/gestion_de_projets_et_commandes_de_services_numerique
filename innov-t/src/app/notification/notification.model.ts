// src/app/notification/notification.model.ts
export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}