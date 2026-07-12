import { BaseController } from './base.controller';
import { DriverService } from '../services/driver.service';
import { IDriver } from '../models/driver.model';

export class DriverController extends BaseController<IDriver> {
  constructor() {
    super(new DriverService());
  }
}
