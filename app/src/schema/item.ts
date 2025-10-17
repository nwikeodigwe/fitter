import { z } from "zod";
import { brandSchema } from "./brand";

const creatorSchema = z.object({
  name: z.string().describe("Full name of the item creator or designer"),
  bio: z
    .string()
    .nullish()
    .describe("Short biography or background of the creator"),
});

export const itemSchema = z.object({
  name: z
    .string()
    .nullish()
    .describe(
      "The display name of the item, used in listings and detail views."
    ),
  slug: z
    .string()
    .nullish()
    .describe(
      "A URL-friendly identifier for the item, typically lowercase and hyphenated."
    ),
  description: z
    .string()
    .nullish()
    .describe(
      "A detailed description of the item, including features, materials, or story."
    ),
  category: z
    .string()
    .nullish()
    .describe(
      "The category this item belongs to, e.g., apparel, bag, shoe, accessory."
    ),
  color: z
    .string()
    .nullish()
    .describe("The primary color of the item, e.g., red, black, navy."),
  color_scheme: z
    .string()
    .nullish()
    .describe(
      "The overall color palette or theme, e.g., monochrome, pastel, earth tones."
    ),
  creator: creatorSchema
    .nullish()
    .describe("Information about the  creator of this item"),
  brand: brandSchema
    .nullish()
    .describe("Information about the brand of this item"),
  release_year: z
    .string()
    .nullish()
    .describe("The year this item was released or first made available."),
  images: z
    .array(z.string())
    .nullish()
    .describe(
      "An array of image URLs showcasing the item from different angles."
    ),
  tags: z
    .array(z.string())
    .nullish()
    .describe(
      "Relevant keywords or labels for this item, used for search and filtering."
    ),
});

export type Item = z.infer<typeof itemSchema>;
