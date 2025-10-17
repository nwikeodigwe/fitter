import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReset extends Document {
  token: string;
  expires: Date;
  user: Types.ObjectId;
}

export const resetSchema = new mongoose.Schema<IReset>(
  {
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Reset = mongoose.model<IReset>("Reset", resetSchema);
