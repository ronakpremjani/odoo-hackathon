import { BaseController } from './base.controller';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user.model';

export class UserController extends BaseController<IUser> {
  constructor() {
    super(new UserService());
  }
}
