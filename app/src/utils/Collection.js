const prisma = require("../functions/prisma");
const slugify = require("slugify");

class Collection {
  constructor(collection = {}) {
    this.collection = {};
    this.id = collection.id || null;
    this.name = collection.name || null;
    this.slug = collection.slug || this.#createSlug(this.name) || null;
    this.description = collection.description || null;
    this.authorId = collection.authorId || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      tags: true,
      author: { select: { id: true } },
    };
  }

  #createSlug(name) {
    return name ? slugify(name, { lower: true }) : null;
  }

  async save(collection = {}) {
    this.name = collection.name || this.name;
    this.description = collection.description || this.description;
    this.slug = collection.slug || this.slug || this.#createSlug(this.name);
    this.tags = collection.tags || this.tags;
    this.id = collection.id || this.id;
    this.authorId = collection.authorId || this.authorId;

    collection = await this.find();

    return collection ? this.update({ id: collection.id }) : this.create();
  }

  async create(collection = {}) {
    const name = collection.name || this.name;
    const description = collection.description || this.description;
    const slug = collection.slug || this.slug || this.#createSlug(name);
    const tags = collection.tags || this.tags;
    const authorId = collection.authorId || this.authorId;

    collection = await prisma.collection.create({
      data: {
        ...(name ? { name } : {}),
        slug: this.#createSlug(name),
        ...(description ? { description } : {}),
        ...(slug ? { slug } : {}),
        ...(tags && tags.length > 0
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
  }

  async update(collection = {}) {
    this.id = collection.id || this.id;
    const name = collection.name || this.name;
    const slug = collection.slug || this.slug;
    const description = collection.description || this.description;
    const tags = collection.tags || this.tags;

    collection = await this.find();

    if (collection)
      return await prisma.collection.update({
        where: { id: collection.id },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(description ? { description } : {}),
          ...(tags &&
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

    return null;
  }

  find(collection = {}) {
    const id = collection.id || this.id;
    const name = collection.name || this.name;
    const slug = collection.slug || this.slug;

    const filters = [id && { id }, name && { name }, slug && { slug }].filter(
      Boolean
    );

    if (filters.length === 0) {
      throw new Error("At least one of id, name or slug must be provided");
    }

    return prisma.collection.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.collection.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}, limit = 20, offset = 0) {
    return prisma.collection.findMany({
      where,
      select: this.selectedFields,
      take: limit,
      skip: offset,
    });
  }

  getTags(
    where = {},
    limit = 10,
    offset = 0,
    orderBy = { collections: { _count: "desc" } }
  ) {
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
  }

  favorite(userId, collectionId = this.id) {
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
  }

  async isFavorite(userId, collectionId = this.id) {
    const favorite = await prisma.favoriteCollection.findFirst({
      where: {
        userId_collectionId: {
          userId: userId,
          collectionId: collectionId,
        },
      },
    });

    return Boolean(favorite);
  }

  unfavorite(userId, collectionId = this.id) {
    return prisma.favoriteCollection.delete({
      where: {
        userId_collectionId: {
          userId: userId,
          collectionId: collectionId,
        },
      },
    });
  }

  upvote(userId, collectionId = this.id) {
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
  }

  downvote(userId, collectionId = this.id) {
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
  }

  async isVoted(userId, collectionId = this.id) {
    const vote = await prisma.collectionVote.findFirst({
      where: {
        userId: userId,
        collectionId: collectionId,
      },
    });

    return Boolean(vote);
  }

  unvote(userId, collectionId = this.id) {
    return prisma.collectionVote.delete({
      where: {
        userId_collectionId: {
          collectionId: collectionId,
          userId: userId,
        },
      },
    });
  }

  async delete(user = {}) {
    this.id = user.id || this.id;

    user = await this.find();
    if (user)
      return await prisma.collection.delete({
        where: {
          id: user.id,
        },
      });

    return null;
  }
}

const collection = new Collection();
module.exports = { collection, Collection };
