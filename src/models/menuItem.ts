import { Document, Schema, model } from 'mongoose';

export interface MenuItem extends Document {
  title: string;
  path: string;
  icon: string;
  roles: string[];
  isActive: boolean;
}

const MenuItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  path: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  roles: { type: [String], required: true },
  isActive: { type: Boolean, default: true },
});

export default model<MenuItem>('MenuItem', MenuItemSchema);