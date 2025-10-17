import slugify from "slugify";

export const slug = (name: string) => {
  return name ? slugify(name, { lower: true }) : null;
};
