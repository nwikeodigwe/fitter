import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";

export interface IBrand extends Document {
  name: string;
  slug: string;
  published: boolean;
  description: string;
  logo?: Types.ObjectId;
  user?: Types.ObjectId;
  items?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  votes?: Types.ObjectId[];
  favorited?: Types.ObjectId[];
  subscriptions?: Types.ObjectId[];
}

export const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    published: { type: Boolean, required: true },
    description: { type: String },
    logo: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
    favorited: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);
