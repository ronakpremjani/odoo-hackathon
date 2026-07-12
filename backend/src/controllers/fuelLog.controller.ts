import { BaseController } from './base.controller';
import { FuelLogService } from '../services/fuelLog.service';
import { IFuelLog } from '../models/fuelLog.model';

export class FuelLogController extends BaseController<IFuelLog> {
  constructor() {
    super(new FuelLogService());
  }
}
