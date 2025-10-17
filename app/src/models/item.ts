import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";

export interface IItem extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  color?: string;
  colorScheme?: string;
  releaseYear: string;
  published: boolean;
  images?: Types.ObjectId[];
  user?: Types.ObjectId;
  brand: Types.ObjectId;
  styles?: Types.ObjectId[];
  tags?: Types.ObjectId[];
  items?: Types.ObjectId[];
  votes?: Types.ObjectId[];
  favorited?: Types.ObjectId[];
  resets?: Types.ObjectId[];
}

export const itemSchema = new mongoose.Schema<IItem>(
  {
    name: { type: String, unique: true, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String },
    published: { type: Boolean },
    category: { type: String },
    color: { type: String },
    colorScheme: { type: String },
    releaseYear: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favorited: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reset" }],
  },
  { timestamps: true }
);

itemSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Item = mongoose.model<IItem>("Item", itemSchema);
