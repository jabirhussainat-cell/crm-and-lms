import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  id: string;
  title: string;
  amount: number;
  category: 'Operations' | 'Marketing' | 'Salaries' | 'Travel' | 'Tech' | 'Property' | 'Other';
  date: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    category: {
      type: String,
      enum: ['Operations', 'Marketing', 'Salaries', 'Travel', 'Tech', 'Property', 'Other'],
      default: 'Other'
    },
    date: { type: String, required: true },
    notes: { type: String, default: '' },
    createdById: { type: String, required: true },
    createdByName: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'expenses'
  }
);

if (mongoose.models.Expense) {
  delete mongoose.models.Expense;
}

export const ExpenseModel: Model<IExpense> = mongoose.model<IExpense>('Expense', ExpenseSchema);
