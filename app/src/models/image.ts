import mongoose, { Schema, Document, Types } from "mongoose";

export interface IImage extends Document {
  url: string;
  brand?: Types.ObjectId;
  item?: Types.ObjectId;
}

export const imageSchema = new mongoose.Schema<IImage>(
  {
    url: { type: String, unique: true, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  },
  { timestamps: true }
);

export const Image = mongoose.model<IImage>("Image", imageSchema);
