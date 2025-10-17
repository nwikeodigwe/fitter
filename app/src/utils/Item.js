const prisma = require("../functions/prisma");
const { logger } = require("./Logger");
const slugify = require("slugify");

class Item {
  constructor(item = {}) {
    this.item = {};
    this.id = item.id || null;
    this.name = item.name || null;
    this.slug = item.slug || null;
    this.category = item.category || null;
    this.depthMap = item.category || null;
    this.releaseYear = item.releaseYear || null;
    this.description = item.description || null;
    this.images = item.images || null;
    this.tags = item.tags || null;
    this.brand = item.brand || null;
    this.userId = item.userId || null;
    this.selectedFields = {
      id: true,
      name: true,
      slug: true,
      description: true,
      depthMap: true,
      images: { select: { id: true, url: true } },
      brand: { select: { id: true, name: true } },
      tags: true,
      creator: { select: { id: true } },
    };
  }

  #createSlug(name) {
    return name ? slugify(name, { lower: true }) : null;
  }

  async save(item = {}) {
    this.name = item.name || this.name;
    this.description = item.description || this.description;
    this.slug = item.slug || this.slug || this.#createSlug(this.name);
    this.tags = item.tags || this.tags;
    this.category = item.category || this.category;
    this.depthMap = item.depthMap || this.depthMap || null;
    this.id = item.id || this.id;
    this.realeaseYear = item.releaseYear || this.releaseYear;
    this.brand = item.brand || this.brand;
    this.images = item.images || this.images;
    this.creator = item.creator || this.creator;

    item = await this.find();

    return item ? this.update({ id: item.id }) : this.create();
  }

  async create(item = {}) {
    const name = item.name || this.name;
    const description = item.description || this.description;
    const slug = item.slug || this.slug || this.#createSlug(name);
    const releaseYear = item.releaseYear || this.releaseYear;
    const category = item.category || this.category;
    const depthMap = item.depthMap || this.depthMap;
    const tags = item.tags || this.tags;
    const brand = item.brand || this.brand;
    const images = item.images || this.images;
    const creator = item.creator || this.creator;

    item = await prisma.item.create({
      data: {
        name,
        slug,
        releaseYear,
        category,
        depthMap,
        description,
        ...(tags &&
          tags.length > 0 && {
            tags: {
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
          }),
        ...(creator
          ? {
              creator: { connect: { id: creator } },
            }
          : {}),
        ...(images && images.length > 0
          ? {
              images: {
                connectOrCreate: images.map((imageUrl) => ({
                  where: { url: imageUrl },
                  create: { url: imageUrl },
                })),
              },
            }
          : {}),
        brand: {
          connectOrCreate: {
            where: { name: brand },
            create: { name: brand, slug: this.#createSlug(brand) },
          },
        },
      },
      select: this.selectedFields,
    });

    this.id = item.id;
    return item;
  }

  update(item = {}) {
    const id = item.id || this.id;
    const name = item.name || this.name;
    const slug = item.slug || this.slug || this.#createSlug(name);
    const category = item.category || this.category;
    const depthMap = item.depthMap || this.depthMap;
    const realeaseYear = item.releaseYear || this.releaseYear;
    const description = item.description || this.description;
    const tags = item.tags || this.tags;
    const brand = item.brand || this.brand;
    const images = item.images || this.images;
    const creator = item.creator || this.creator;

    return prisma.item.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(category ? { category } : {}),
        ...(depthMap ? { depthMap } : {}),
        ...(realeaseYear ? { realeaseYear } : {}),
        ...(description ? { description } : {}),
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
        ...(creator
          ? {
              creator: { connect: { id: creator } },
            }
          : {}),
        ...(images
          ? {
              images: {
                connectOrCreate: images.map((image) => ({
                  where: { url: image },
                  create: { url: image },
                })),
              },
            }
          : {}),
        ...(brand
          ? {
              brand: {
                connectOrCreate: {
                  where: { name: brand },
                  create: { name: brand, slug: this.#createSlug(brand) },
                },
              },
            }
          : {}),
      },
      select: this.selectedFields,
    });
  }

  find(item = {}) {
    logger.info("Finding item...");
    const id = item.id || this.id;
    const name = item.name || this.name;
    const slug = item.slug || this.slug;

    const filters = [id && { id }, name && { name }, slug && { slug }].filter(
      Boolean
    );

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.item.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.item.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySlug(slug = this.slug) {
    try {
      await prisma.item.findFirst({
        where: {
          slug,
        },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  findMany(filter = {}, limit = 10, offset = 0, order) {
    return prisma.item.findMany({
      where: filter,
      select: this.selectedFields,
      take: limit,
      skip: offset,
      orderBy: order,
    });
  }

  getTags(
    where = {},
    limit = 4,
    offset = 0,
    orderBy = { items: { _count: "desc" } }
  ) {
    return prisma.tag.findMany({
      where,
      select: {
        name: true,
        items: { select: { name: true }, distinct: ["name"], take: limit },
      },
      distinct: ["name"],
      take: limit,
      skip: offset,
      orderBy,
    });
  }

  favorite(user) {
    return prisma.favoriteItem.upsert({
      where: {
        userId_itemId: {
          userId: user,
          itemId: this.id,
        },
      },
      create: {
        user: {
          connect: {
            id: user,
          },
        },
        item: {
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
  }

  isFavorite(user) {
    return prisma.favoriteItem.findFirst({
      where: {
        userId: user,
        itemId: this.id,
      },
      select: {
        id: true,
      },
    });
  }

  async unfavorite(user) {
    await prisma.favoriteItem.delete({
      where: {
        userId_itemId: {
          userId: user,
          itemId: this.id,
        },
      },
    });
  }

  upvote(user) {
    return prisma.itemVote.upsert({
      where: {
        userId_itemId: { itemId: this.id, userId: user },
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
        item: {
          connect: {
            id: this.id,
          },
        },
        vote: true,
      },
    });
  }

  isVoted(user) {
    return prisma.itemVote.findFirst({
      where: {
        itemId: this.id,
        userId: user,
      },
    });
  }

  downvote(user) {
    return prisma.itemVote.upsert({
      where: {
        userId_itemId: { itemId: this.id, userId: user },
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
        item: {
          connect: {
            id: this.id,
          },
        },
        vote: false,
      },
    });
  }

  unvote(user) {
    return prisma.itemVote.delete({
      where: {
        userId_itemId: { itemId: this.id, userId: user },
      },
    });
  }

  async delete(item = {}) {
    this.id = item.id || this.id;

    item = await this.find();
    if (item)
      return prisma.item.delete({
        where: {
          id: item.id,
        },
        select: { id: true },
      });

    return null;
  }

  deleteMany() {
    return prisma.item.deleteMany();
  }
}

const item = new Item();
module.exports = { item, Item };
