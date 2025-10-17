import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFavorite extends Document {
  brands?: Types.ObjectId[];
  collections?: Types.ObjectId[];
  styles?: Types.ObjectId[];
  comments?: Types.ObjectId[];
  items?: Types.ObjectId[];
}

export const favoriteSchema = new mongoose.Schema<IFavorite>(
  {
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
