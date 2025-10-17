import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  subscriber: Types.ObjectId;
  subscribedUsers: Types.ObjectId[];
  subscribedBrands: Types.ObjectId[];
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscribedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    subscribedBrands: [{ type: Schema.Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>(
  "Subsription",
  subscriptionSchema
);
