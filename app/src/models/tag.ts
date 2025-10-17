import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITag extends Document {
  name: string;
  brands?: Types.ObjectId[];
  collections?: Types.ObjectId[];
  styles?: Types.ObjectId[];
  comments?: Types.ObjectId[];
  items?: Types.ObjectId[];
}

export const tagSchema = new mongoose.Schema<ITag>(
  {
    name: { type: String, unique: true, required: true },
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
