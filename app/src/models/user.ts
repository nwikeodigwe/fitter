import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  social?: string;
  profile?: Types.ObjectId;
  brands?: Types.ObjectId[];
  collections?: Types.ObjectId[];
  styles?: Types.ObjectId[];
  items?: Types.ObjectId[];
  resets?: Types.ObjectId[];
}

export const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    social: { type: String },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    resets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reset" }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
