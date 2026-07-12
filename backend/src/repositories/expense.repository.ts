import { BaseRepository } from './base.repository';
import { Expense, IExpense } from '../models/expense.model';

export class ExpenseRepository extends BaseRepository<IExpense> {
  constructor() {
    super(Expense);
  }
}
