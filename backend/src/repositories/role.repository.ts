import { BaseRepository } from './base.repository';
import { Role, IRole } from '../models/role.model';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(Role);
  }
}
