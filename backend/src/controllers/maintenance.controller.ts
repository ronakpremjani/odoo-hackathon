import { BaseController } from './base.controller';
import { MaintenanceService } from '../services/maintenance.service';
import { IMaintenance } from '../models/maintenance.model';

export class MaintenanceController extends BaseController<IMaintenance> {
  constructor() {
    super(new MaintenanceService());
  }
}
