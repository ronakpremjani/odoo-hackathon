import { BaseController } from './base.controller';
import { VehicleService } from '../services/vehicle.service';
import { IVehicle } from '../models/vehicle.model';

export class VehicleController extends BaseController<IVehicle> {
  constructor() {
    super(new VehicleService());
  }
}
