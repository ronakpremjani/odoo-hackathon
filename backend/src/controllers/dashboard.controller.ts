import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ResponseHandler } from '../utils/responseHandler';

export class DashboardController {
  private static readonly dashboardService = new DashboardService();

  static getKpis = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const kpis = await DashboardController.dashboardService.getKpis();
      ResponseHandler.success(res, kpis, 'KPI statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  static getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await DashboardController.dashboardService.getAnalytics();
      ResponseHandler.success(res, analytics, 'Analytics data trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
