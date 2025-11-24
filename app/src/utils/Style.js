const prisma = require("../functions/prisma");
const { logger } = require("./logger");
const slugify = require("slugify");

class Style {
  constructor(style = {}) {
    this.id = style.id;
    this.name = style.name;
    this.slug = this.slug || null;
    this.description = style.description;
    this.collection = style.collection;
    this.images = style.images;
    this.tags = style.tags || [];
    this.author = style.author;
    this.select = style.select;

    this.defaultSelect = {
      id: true,
      name: true,
      slug: true,
      description: true,
      tags: { select: { name: true } },
      images: { select: { url: true } },
      collection: {
        select: {
          name: true,
          slug: true,
        },
      },
      author: {
        select: { name: true },
      },
      releaseYear: true,
      createdAt: true,
      _count: {
        select: { items: true },
      },
    };
  }

  #createSlug(name) {
    return name ? slugify(name, { lower: true }) : null;
  }

  async save(style = {}) {
    this.id = style.id || this.id;
    this.name = style.name || this.name;
    this.slug = style.slug || this.slug || this.#createSlug(this.name);
    this.description = style.description || this.description;
    this.images = style.images || this.images;
    this.tags = style.tags || this.tags;
    this.author = style.author || this.author;
    this.collection = style.collection || this.collection;

    style = await this.find();

    return style ? this.update({ id: style.id }) : this.create();
  }

  async create(style = {}) {
    try {
      const name = style.name || this.name;
      const slug = style.slug || this.slug || this.#createSlug(name);
      const description = style.description || this.description;
      const images = style.images || this.images;
      const tags = style.tags || this.tags;
      const author = style.author || this.author;
      const collection = style.collection || this.collection;

      style = await prisma.style.create({
        data: {
          name,
          slug,
          description,
          ...(Array.isArray(images) && images.length > 0
            ? {
                images: {
                  connectOrCreate: images.map((url) => ({
                    where: { url },
                    create: { url },
                  })),
                },
              }
            : {}),
          ...(Array.isArray(tags) && tags.length > 0
            ? {
                tags: {
                  connectOrCreate: tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                  })),
                },
              }
            : {}),
          ...(collection
            ? {
                collection: {
                  connect: {
                    id: collection,
                  },
                },
              }
            : {}),
          author: {
            connect: {
              id: author,
            },
          },
        },
        select: this.selectedFields,
      });

      this.id = style.id;
      return style;
    } catch (err) {
      logger.error(err);
    }
  }

  async update(style = {}) {
    try {
      const id = style.id || this.id;
      const name = style.name || this.name;
      const slug = style.slug || this.slug || this.#createSlug(name);
      const description = style.description || this.description;
      const images = style.image || this.images;
      const tags = style.tags || this.tags;
      const collection = style.collection || this.collection;

      style = await this.find();

      if (!style) return;

      return prisma.style.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(description ? { description } : {}),
          ...(Array.isArray(images) && images.length > 0
            ? {
                images: {
                  connectOrCreate: images.map((url) => ({
                    where: { url },
                    create: { url },
                  })),
                },
              }
            : {}),
          ...(Array.isArray(tags) && tags.length > 0
            ? {
                tags: {
                  deleteMany: {},
                  connectOrCreate: tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                  })),
                },
              }
            : {}),
          ...(collection
            ? { collection: { connect: { id: collection } } }
            : {}),
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  find(style = {}) {
    try {
      const id = style.id || this.id;
      const name = style.name || this.name;
      const slug = style.slug || this.slug;
      const collection = style.collection || this.collection;

      const filters = [
        id && { id },
        name && { name },
        slug && { slug },
        collection && { collection: { id: collection } },
      ].filter(Boolean);

      if (filters.length === 0) {
        throw new Error(
          "At least one of id, name, slug or collection, must be provided"
        );
      }

      return prisma.style.findFirst({
        where: {
          OR: filters,
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  findMany({ filter = {}, limit = 20, offset = 0, orderBy = { createdAt: "desc" } }) {
    try {
      return prisma.style.findMany({
        where: filter,
        select: { ...this.selectedFields, _count: { select: { items: true } } },
        take: limit,
        skip: offset,
        orderBy,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  count(filter = {}) {
    try {
      return prisma.style.count({ where: filter });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  getTags(
    where = {},
    limit = 4,
    offset = 0,
    orderBy = { styles: { _count: "desc" } }
  ) {
    try {
      return prisma.tag.findMany({
        where,
        select: {
          name: true,
          styles: { select: { name: true }, distinct: ["name"], take: limit },
        },
        distinct: ["name"],
        take: limit,
        skip: offset,
        orderBy,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  favorite(user) {
    try {
      return prisma.favoriteStyle.upsert({
        where: {
          userId_styleId: {
            userId: user,
            styleId: this.id,
          },
        },
        create: {
          user: {
            connect: {
              id: user,
            },
          },
          style: {
            connect: {
              id: this.id,
            },
          },
        },
        update: {},
        select: {
          id: true,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  isFavorite(user) {
    try {
      return !!prisma.favoriteStyle.findFirst({
        where: {
          userId: user,
          styleId: this.id,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async unfavorite(user) {
    try {
      return prisma.favoriteStyle.delete({
        where: {
          userId_styleId: {
            userId: user,
            styleId: this.id,
          },
        },
        select: { id: true },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  upvote(user) {
    try {
      return prisma.styleVote.upsert({
        where: {
          userId_styleId: { styleId: this.id, userId: user },
        },
        update: {
          vote: true,
        },
        create: {
          user: {
            connect: {
              id: user,
            },
          },
          style: {
            connect: {
              id: this.id,
            },
          },
          vote: true,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  isVoted(user) {
    try {
      return !!prisma.styleVote.findFirst({
        where: {
          styleId: this.id,
          userId: user,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  downvote(user) {
    try {
      return prisma.styleVote.upsert({
        where: {
          userId_styleId: { styleId: this.id, userId: user },
        },
        update: {
          vote: false,
        },
        create: {
          user: {
            connect: {
              id: user,
            },
          },
          style: {
            connect: {
              id: this.id,
            },
          },
          vote: false,
        },
        select: { id: true },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  unvote(user) {
    try {
      return prisma.styleVote.delete({
        where: {
          userId_styleId: { styleId: this.id, userId: user },
        },
        select: { id: true },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  upvoteCount() {
    try {
      return prisma.styleVote.count({
        where: { itemId: this.id, vote: true },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  downvoteCount() {
    try {
      return prisma.styleVote.count({
        where: { styleId: this.id, vote: false },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async delete(style = {}) {
    try {
      this.id = style.id || this.id;
      style = await this.find();

      if (!style) return;

      return prisma.style.delete({
        where: {
          OR: [{ id: this.id }, { slug: this.slug }],
        },
        select: { id: true },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  deleteMany() {
    try {
      return prisma.style.deleteMany();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

const styles = new Style();
module.exports = { styles, Style };
