import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { NotificationService } from '../services/notification.service';
import { INotification } from '../models/notification.model';
import { ResponseHandler } from '../utils/responseHandler';

export class NotificationController extends BaseController<INotification> {
  protected declare readonly service: NotificationService;

  constructor() {
    super(new NotificationService());
  }

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.markAsRead(req.params.id);
      ResponseHandler.success(res, item, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipientId = req.user?.id;
      await this.service.markAllAsRead(recipientId!);
      ResponseHandler.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  };
}
