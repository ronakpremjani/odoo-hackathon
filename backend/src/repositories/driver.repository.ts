import { BaseRepository } from './base.repository';
import { Driver, IDriver } from '../models/driver.model';

export class DriverRepository extends BaseRepository<IDriver> {
  constructor() {
    super(Driver);
  }
}
