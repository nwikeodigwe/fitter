const prisma = require("../functions/prisma");
const slugify = require("slugify");
const { logger } = require("./Logger");

class Brand {
  constructor(brand = {}) {
    this.id = brand.id || null;
    this.name = brand.name || null;
    this.description = brand.description || null;
    this.tags = brand.tags || [];
    this.images = brand.images || null;
    this.owner = brand.owner || null;
    this.slug = brand.slug || null;
    this.selectedFields = {
      id: true,
      name: true,
      slug: true,
      description: true,
      images: { select: { id: true, url: true } },
      owner: { select: { id: true, name: true } },
      tags: { select: { name: true } },
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

  async save(brand = {}) {
    this.name = brand.name || this.name;
    this.description = brand.description || this.description;
    this.slug = brand.slug || this.slug || this.#createSlug(this.name);
    this.tags = brand.tags || this.tags;
    this.owner = brand.owner || this.owner;
    this.images = brand.images || this.images;
    this.id = brand.id || this.id;

    brand = await this.find({ id: this.id, name: this.name });

    return brand ? this.update({ id: brand.id }) : this.create();
  }

  async create(brandData = {}) {
    try {
      const {
        name = this.name,
        slug = this.slug || this.#createSlug(name),
        description = this.description,
        tags = this.tags,
        images = this.images,
      } = brandData;

      const brand = await prisma.brand.create({
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
                    where: { name: tag.trim() },
                    create: { name: tag.trim() },
                  })),
                },
              }
            : {}),
        },
        select: this.selectedFields,
      });

      this.id = brand.id;
      return brand;
    } catch (error) {
      logger.error(err);
    }
  }

  async update(brand = {}) {
    try {
      const name = brand.name || this.name;
      const description = brand.description || this.description;
      const slug = brand.slug || this.slug || this.#createSlug(name);
      const tags = brand.tags || this.tags;
      const owner = brand.owner || this.owner;
      const logo = brand.logo || this.logo;
      const id = brand.id || this.id;

      brand = await this.find();

      if (!brand) return;

      return prisma.brand.update({
        where: {
          id,
          ownerId: owner,
        },
        data: {
          ...(name ? { name } : {}),
          slug,
          ...(description ? { description } : {}),
          ...(Array.isArray(tags) && tags.length
            ? {
                tags: {
                  connectOrCreate: tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                  })),
                },
              }
            : {}),
          ...(logo ? { logo: { connect: { id: logo } } } : {}),
          ...(owner ? { owner: { connect: { id: owner } } } : {}),
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
    }
  }

  async find(brand = {}) {
    try {
      const id = brand.id || this.id;
      const name = brand.name || this.name;
      const slug = brand.slug || this.slug;

      const filters = [id && { id }, name && { name }, slug && { slug }].filter(
        Boolean
      );

      if (!filters.length) {
        throw new Error("At least one of id, name or slug must be provided");
      }

      return prisma.brand.findFirst({
        where: { OR: filters },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  findById(id = this.id) {
    try {
      return prisma.brand.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      logger.error(err);
      // throw err;
    }
  }

  findMany(
    filter = {},
    limit = 20,
    offset = 0,
    orderBy = { items: { _count: "desc" } }
  ) {
    try {
      return prisma.brand.findMany({
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
      return prisma.brand.count({ where: filter });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  getTags(
    where = {},
    limit = 4,
    offset = 0,
    orderBy = { brands: { _count: "desc" } }
  ) {
    try {
      return prisma.tag.findMany({
        where,
        select: {
          name: true,
          brands: { select: { name: true }, distinct: ["name"], take: limit },
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
      return prisma.favoriteBrand.upsert({
        where: {
          userId_brandId: {
            userId: user,
            brandId: this.id,
          },
        },
        create: {
          user: {
            connect: {
              id: user,
            },
          },
          brand: {
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
      return prisma.favoriteBrand.findFirst({
        where: {
          userId: user,
          brandId: this.id,
        },
        select: {
          id: true,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async unfavorite(user) {
    try {
      await prisma.favoriteBrand.delete({
        where: {
          userId_brandId: {
            userId: user,
            brandId: this.id,
          },
        },
      });
    } catch (err) {
      logger.err(err);
      throw err;
    }
  }

  upvote(user) {
    try {
      return prisma.brandVote.upsert({
        where: {
          userId_brandId: { brandId: this.id, userId: user },
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
          brand: {
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
      return prisma.brandVote.findFirst({
        where: {
          brandId: this.id,
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
      return prisma.brandVote.upsert({
        where: {
          userId_brandId: { brandId: this.id, userId: user },
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
          brand: {
            connect: {
              id: this.id,
            },
          },
          vote: false,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  unvote(user) {
    try {
      return prisma.brandVote.delete({
        where: {
          userId_brandId: { brandId: this.id, userId: user },
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  isSubscribed(user) {
    try {
      return prisma.brandSubscription.findFirst({
        where: {
          brandId: this.id,
          userId: user,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  subscribe(user) {
    try {
      return prisma.brandSubscription.create({
        data: {
          user: {
            connect: {
              id: user,
            },
          },
          brand: {
            connect: {
              id: this.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  unsubscribe(user) {
    try {
      return prisma.brandSubscription.delete({
        where: {
          user: { id: user },
          brand: { id: this.id },
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async delete(brand = {}) {
    try {
      this.id = brand.id || this.id;
      this.email = brand.email || this.email;

      brand = await this.find();

      if (!brand) return;

      return prisma.brand.delete({
        where: {
          id: brand.id,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  deleteMany(where = {}) {
    try {
      return prisma.deleteMany({
        where,
      });
    } catch (err) {
      throw err;
    }
  }
}

const brands = new Brand();
module.exports = { brands, Brand };
