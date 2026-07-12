import { BaseRepository } from './base.repository';
import { Maintenance, IMaintenance } from '../models/maintenance.model';

export class MaintenanceRepository extends BaseRepository<IMaintenance> {
  constructor() {
    super(Maintenance);
  }
}
