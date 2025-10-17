import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProfile extends Document {
  firstname: string;
  lastname: string;
  bio: string;
  user: Types.ObjectId;
}

const profileSchema = new Schema<IProfile>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    bio: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);
