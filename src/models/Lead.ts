import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ILead extends Document {
  id: string;
  customerName: string;
  noOfKids: number;
  noOfAdults: number;
  checkInDate: string;
  checkOutDate: string;
  location: string;
  status: 'open' | 'closed' | 'follow_up';
  customerNotes: string;
  customerContactNumber?: string;
  propertyName?: string;
  /** Profit share with property & Tripeloo: % type, B2B, or any number (string) */
  profitShare?: string;
  propertyType?: string;
  b2bRef?: string;
  cusAdv?: string;
  advToProperty?: string;
  b2b?: string;
  b2c?: string;
  staffId: string;
  staffName: string;
  recordedAt: string;
  activityLog: IActivityNote[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivityNoteSchema = new Schema<IActivityNote>({
  id: { type: String, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const LeadSchema = new Schema<ILead>(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    noOfKids: { type: Number, default: 0 },
    noOfAdults: { type: Number, default: 1 },
    checkInDate: { type: String, default: '' },
    checkOutDate: { type: String, default: '' },
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'closed', 'follow_up'],
      default: 'open'
    },
    customerNotes: { type: String, default: '' },
    customerContactNumber: { type: String, default: '' },
    propertyName: { type: String, default: '' },
    profitShare: { type: String, default: '' },
    propertyType: { type: String, default: '' },
    b2bRef: { type: String, default: '' },
    cusAdv: { type: String, default: '' },
    advToProperty: { type: String, default: '' },
    b2b: { type: String, default: '' },
    b2c: { type: String, default: '' },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    recordedAt: { type: String, required: true },
    activityLog: { type: [ActivityNoteSchema], default: [] }
  },
  {
    timestamps: true,
    collection: 'leads',
    strict: false
  }
);

if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

export const LeadModel: Model<ILead> = mongoose.model<ILead>('Lead', LeadSchema);
