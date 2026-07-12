import { BaseService } from './base.service';
import { IExpense } from '../models/expense.model';
import { ExpenseRepository } from '../repositories/expense.repository';

export class ExpenseService extends BaseService<IExpense> {
  constructor() {
    super(new ExpenseRepository(), 'Expense');
  }
}
