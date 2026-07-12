import { BaseService } from './base.service';
import { IRole } from '../models/role.model';
import { RoleRepository } from '../repositories/role.repository';

export class RoleService extends BaseService<IRole> {
  constructor() {
    super(new RoleRepository(), 'Role');
  }
}
