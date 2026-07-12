import { BaseService } from './base.service';
import { INotification } from '../models/notification.model';
import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService extends BaseService<INotification> {
  protected declare readonly repository: NotificationRepository;

  constructor() {
    super(new NotificationRepository(), 'Notification');
  }

  async markAsRead(id: string): Promise<INotification> {
    return this.update(id, { status: 'Read' });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.repository.updateMany({ recipient: recipientId, status: 'Unread' }, { status: 'Read' });
  }
}
