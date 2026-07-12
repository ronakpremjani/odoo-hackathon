import { BaseController } from './base.controller';
import { ExpenseService } from '../services/expense.service';
import { IExpense } from '../models/expense.model';

export class ExpenseController extends BaseController<IExpense> {
  constructor() {
    super(new ExpenseService());
  }
}
