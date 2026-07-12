import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { VehicleService } from '../services/vehicle.service';
import { IVehicle } from '../models/vehicle.model';
import { ResponseHandler } from '../utils/responseHandler';

export class VehicleController extends BaseController<IVehicle> {
  constructor() {
    super(new VehicleService());
  }

  getVehicleMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await (this.service as VehicleService).getVehicleMetrics(req.params.id);
      ResponseHandler.success(res, metrics, 'Vehicle operational metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
