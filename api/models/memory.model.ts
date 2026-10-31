
import { model, models, Schema, type Model } from 'mongoose';

export interface MemoryFields {
  title: string;
  personName: string;
  relationship?: string;
  story: string;
  favoriteThings: string[];
  memoryDate?: Date;
}

const memorySchema = new Schema<MemoryFields>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    personName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    story: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    favoriteThings: {
      type: [{ type: String, trim: true, maxlength: 100 }],
      default: [],
      validate: {
        validator: (items: string[]) => items.length <= 10,
        message: 'You can add up to 10 favorite things.',
      },
    },
    memoryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Memory =
  (models['Memory'] as Model<MemoryFields> | undefined) ??
  model<MemoryFields>('Memory', memorySchema);

export default Memory;
