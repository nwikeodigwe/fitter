import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  content: String;
  user: Types.ObjectId;
  replies?: Types.ObjectId;
  styles: Types.ObjectId[];
  collections: Types.ObjectId[];
  items: Types.ObjectId[];
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    styles: [{ type: Schema.Types.ObjectId, ref: "Style" }],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
