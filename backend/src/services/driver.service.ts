import { BaseService } from './base.service';
import { IDriver } from '../models/driver.model';
import { DriverRepository } from '../repositories/driver.repository';

export class DriverService extends BaseService<IDriver> {
  constructor() {
    super(new DriverRepository(), 'Driver');
  }
}
