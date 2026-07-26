import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncome extends Document {
  id: string;
  title: string;
  amount: number;
  category: 'Deals' | 'Other income' | 'Refund' | 'Adjustment' | 'Other';
  date: string;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    category: {
      type: String,
      enum: ['Deals', 'Other income', 'Refund', 'Adjustment', 'Other'],
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
    collection: 'incomes'
  }
);

if (mongoose.models.Income) {
  delete mongoose.models.Income;
}

export const IncomeModel: Model<IIncome> = mongoose.model<IIncome>('Income', IncomeSchema);
