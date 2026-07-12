import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum ExpenseCategory {
  FUEL = 'Fuel',
  MAINTENANCE = 'Maintenance',
  TOLL = 'Toll',
  INSURANCE = 'Insurance',
  PERMIT = 'Permit',
  FINES = 'Fines',
  SALARY = 'Salary',
  OTHER = 'Other'
}

export enum ExpenseStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid'
}

export interface IExpense extends Document, SoftDeleteDocument {
  expenseId: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  status: ExpenseStatus;
  vehicle?: Schema.Types.ObjectId;
  driver?: Schema.Types.ObjectId;
  trip?: Schema.Types.ObjectId;
  maintenance?: Schema.Types.ObjectId;
  description: string;
  receiptUrl?: string;
  approvedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseId: {
      type: String,
      required: [true, 'Expense ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: [true, 'Expense category is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Expense amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.PENDING,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    maintenance: {
      type: Schema.Types.ObjectId,
      ref: 'Maintenance',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
ExpenseSchema.plugin(softDeletePlugin);

export const Expense = model<IExpense>('Expense', ExpenseSchema);
