import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminNote extends Document {
  id: string;
  text: string;
  label: 'Accounts' | 'Operations' | 'Tech' | 'HR' | 'Sales' | 'General';
  date: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: Date;
}

const AdminNoteSchema = new Schema<IAdminNote>(
  {
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    label: {
      type: String,
      enum: ['Accounts', 'Operations', 'Tech', 'HR', 'Sales', 'General'],
      default: 'General'
    },
    date: { type: String, required: true },
    createdById: { type: String, required: true },
    createdByName: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
  {
    timestamps: true,
    collection: 'admin_notes'
  }
);

if (mongoose.models.AdminNote) {
  delete mongoose.models.AdminNote;
}

export const AdminNoteModel: Model<IAdminNote> =
  mongoose.model<IAdminNote>('AdminNote', AdminNoteSchema);
