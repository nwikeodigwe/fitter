const prisma = require("../functions/prisma");
const { logger } = require("./Logger");
const slugify = require("slugify");

class Collection {
  constructor(collection = {}) {
    this.collection = {};
    this.id = collection.id || null;
    this.name = collection.name || null;
    this.slug = collection.slug || this.#createSlug(this.name) || null;
    this.description = collection.description || null;
    this.images = collection.images || null;
    this.authorId = collection.authorId || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      images: { select: { id: true, url: true } },
      tags: true,
      author: { select: { id: true } },
      _count: {
        select: { styles: true },
      },
      releaseYear: true,
      createdAt: true,
    };
  }

  #createSlug(name) {
    return name ? slugify(name, { lower: true }) : null;
  }

  async save(collection = {}) {
    this.name = collection.name || this.name;
    this.description = collection.description || this.description;
    this.slug = collection.slug || this.slug || this.#createSlug(this.name);
    this.images = collection.images || this.images;
    this.tags = collection.tags || this.tags;
    this.id = collection.id || this.id;
    this.authorId = collection.authorId || this.authorId;

    collection = await this.find();

    return collection ? this.update({ id: collection.id }) : this.create();
  }

  async create(collection = {}) {
    try {
      const name = collection.name || this.name;
      const description = collection.description || this.description;
      const slug = collection.slug || this.slug || this.#createSlug(name);
      const images = collection.images || this.images;
      const tags = collection.tags || this.tags;
      const authorId = collection.authorId || this.authorId;

      collection = await prisma.collection.create({
        data: {
          ...(name ? { name } : {}),
          slug: this.#createSlug(name),
          ...(description ? { description } : {}),
          ...(slug ? { slug } : {}),
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
          author: { connect: { id: authorId } },
        },
        select: this.selectedFields,
      });

      this.id = collection.id;
      return collection;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async update(collection = {}) {
    try {
      this.id = collection.id || this.id;
      const name = collection.name || this.name;
      const slug = collection.slug || this.slug;
      const description = collection.description || this.description;
      const images = collection.images || this.images;
      const tags = collection.tags || this.tags;

      collection = await this.find();

      if (!collection) return;

      return await prisma.collection.update({
        where: { id: collection.id },
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
          ...(Array.isArray(tags) &&
            tags.length > 0 && {
              tags: {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }),
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async find(collection = {}) {
    try {
      const id = collection.id || this.id;
      const slug = collection.slug || this.slug;

      const filters = [id && { id }, slug && { slug }].filter(Boolean);

      if (filters.length === 0) {
        throw new Error("At least one of id or slug must be provided");
      }

      return prisma.collection.findFirst({
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

  findById(id = this.id) {
    try {
      return prisma.collection.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  findMany(filter = {}, limit = 20, offset = 0, order = {}) {
    try {
      return prisma.collection.findMany({
        where: filter,
        select: this.selectedFields,
        take: limit,
        skip: offset,
        orderBy: order,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  count(filter = {}) {
    try {
      return prisma.collection.count({ where: filter });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  getTags(
    where = {},
    limit = 10,
    offset = 0,
    orderBy = { collections: { _count: "desc" } }
  ) {
    try {
      return prisma.tag.findMany({
        where,
        select: {
          name: true,
          collections: {
            select: { name: true },
            distinct: ["name"],
            take: limit / 2,
          },
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

  favorite(userId, collectionId = this.id) {
    try {
      return prisma.favoriteCollection.upsert({
        where: {
          userId_collectionId: {
            userId: userId,
            collectionId: collectionId,
          },
        },
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          collection: {
            connect: {
              id: collectionId,
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
    }
  }

  async isFavorite(userId, collectionId = this.id) {
    try {
      return !!(await prisma.favoriteCollection.findFirst({
        where: {
          userId_collectionId: {
            userId: userId,
            collectionId: collectionId,
          },
        },
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  unfavorite(userId, collectionId = this.id) {
    try {
      return prisma.favoriteCollection.delete({
        where: {
          userId_collectionId: {
            userId: userId,
            collectionId: collectionId,
          },
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  upvote(userId, collectionId = this.id) {
    try {
      return prisma.collectionVote.upsert({
        where: {
          userId_collectionId: {
            collectionId: collectionId,
            userId: userId,
          },
        },
        update: {
          vote: true,
        },
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          collection: {
            connect: {
              id: collectionId,
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

  downvote(userId, collectionId = this.id) {
    try {
      return prisma.collectionVote.upsert({
        where: {
          userId_collectionId: {
            collectionId: collectionId,
            userId: userId,
          },
        },
        update: {
          vote: false,
        },
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          collection: {
            connect: {
              id: collectionId,
            },
          },
          vote: false,
        },
      });
    } catch (err) {
      logger.info(err);
    }
  }

  async isVoted(userId, collectionId = this.id) {
    try {
      return !!(await prisma.collectionVote.findFirst({
        where: {
          userId: userId,
          collectionId: collectionId,
        },
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  unvote(userId, collectionId = this.id) {
    try {
      return prisma.collectionVote.delete({
        where: {
          userId_collectionId: {
            collectionId: collectionId,
            userId: userId,
          },
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async delete(user = {}) {
    try {
      this.id = user.id || this.id;

      user = await this.find();
      if (!user) return;

      return await prisma.collection.delete({
        where: {
          id: user.id,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

const collections = new Collection();
module.exports = { collections, Collection };
