import { BaseService } from './base.service';
import { IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

export class UserService extends BaseService<IUser> {
  constructor() {
    super(new UserRepository(), 'User');
  }
}
