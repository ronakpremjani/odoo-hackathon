import { BaseService } from './base.service';
import { IFuelLog } from '../models/fuelLog.model';
import { FuelLogRepository } from '../repositories/fuelLog.repository';

export class FuelLogService extends BaseService<IFuelLog> {
  constructor() {
    super(new FuelLogRepository(), 'FuelLog');
  }
}
