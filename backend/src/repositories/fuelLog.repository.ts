import { BaseRepository } from './base.repository';
import { FuelLog, IFuelLog } from '../models/fuelLog.model';

export class FuelLogRepository extends BaseRepository<IFuelLog> {
  constructor() {
    super(FuelLog);
  }
}
