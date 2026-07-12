import { BaseRepository } from './base.repository';
import { Notification, INotification } from '../models/notification.model';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async updateMany(filter: any, update: any) {
    return this.model.updateMany(filter, update).exec();
  }
}
