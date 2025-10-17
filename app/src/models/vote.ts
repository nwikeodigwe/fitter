import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVote extends Document {
  voter: Types.ObjectId;
  brands: Types.ObjectId[];
  styles: Types.ObjectId[];
  items: Types.ObjectId[];
  collections: Types.ObjectId[];
}

export const voteSchema = new Schema<IVote>(
  {
    voter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brands: [{ type: Schema.Types.ObjectId, ref: "Brand" }],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    styles: [{ type: Schema.Types.ObjectId, ref: "Style" }],
    items: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
  },
  { timestamps: true }
);

export const Vote = mongoose.model<IVote>("Subsription", voteSchema);
