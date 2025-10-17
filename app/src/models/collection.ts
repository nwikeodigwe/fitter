import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";

export interface ICollection extends Document {
  name: string;
  slug: string;
  published: boolean;
  description: string;
  user?: Types.ObjectId;
  styles?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  votes?: Types.ObjectId[];
  favorited?: Types.ObjectId[];
}

export const collectionSchema = new mongoose.Schema<ICollection>(
  {
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    published: { type: Boolean, default: false },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    favorited: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }],
  },
  { timestamps: true }
);

collectionSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Collection = mongoose.model<ICollection>(
  "Collection",
  collectionSchema
);
