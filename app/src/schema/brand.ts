import { z } from "zod";

const creatorSchema = z.object({
  name: z.string().describe("Full name of the brand creator"),
  joinedAt: z.date().describe("Date the creator joined or founded the brand"),
  bio: z
    .string()
    .nullish()
    .describe("Short biography or background of the creator"),
});

export const brandSchema = z.object({
  name: z.string().describe("The display brand name for the item."),
  slug: z
    .string()
    .describe(
      "A URL-friendly identifier for the brand, typically lowercase and hyphenated."
    ),
  description: z
    .string()
    .nullish()
    .describe(
      "A detailed description of the brand, including features, materials, or story."
    ),
  establishedAt: z
    .date()
    .nullish()
    .describe("A date for when this brand was established."),
  creator: creatorSchema
    .nullish()
    .describe("Information about the brand's creator."),
  logo: z
    .string()
    .url()
    .nullish()
    .describe("An image URL of the current official brand logo."),
  tags: z
    .array(z.string())
    .default([])
    .describe(
      "Relevant keywords or labels for this brand, used for search and filtering."
    ),
  isActive: z
    .boolean()
    .default(true)
    .describe("Whether the brand is currently active or discontinued."),
  social: z
    .object({
      instagram: z.string().url().nullish(),
      twitter: z.string().url().nullish(),
      website: z.string().url().nullish(),
    })
    .nullish()
    .describe("Social media and website links for the brand."),
});
