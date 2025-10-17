const prisma = require("../functions/prisma");
const slugify = require("slugify");
const { logger } = require("./Logger");

class Brand {
  constructor(brand = {}) {
    this.id = brand.id || null;
    this.name = brand.name || null;
    this.description = brand.description || null;
    this.tags = brand.tags || [];
    this.logo = brand.logo || null;
    this.owner = brand.owner || null;
    this.slug = brand.slug || null;
    this.selectedFields = {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { id: true, name: true } },
      tags: { select: { name: true } },
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
    this.logo = brand.logo || this.logo;
    this.id = brand.id || this.id;

    brand = await this.find({ id: this.id, name: this.name });

    return brand ? this.update({ id: brand.id }) : this.create();
  }

  async create(brand = {}) {
    logger.info(`Creating brand...`);
    const name = brand.name || this.name;
    const slug = brand.slug || this.slug || this.#createSlug(name);
    const description = brand.description || this.description;
    const tags = brand.tags || this.tags;
    // const owner = brand.owner || this.owner;
    const owner = undefined;
    // const logo = undefined;
    const logo = brand.logo || this.logo;
    brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description,
        ...(logo ? { logo: { connect: { id: logo } } } : {}),
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
        ...(owner ? { owner: { connect: { id: owner } } } : {}),
      },
      select: this.selectedFields,
    });
    console.log(brand);
    this.id = brand.id;
    return brand;
  }

  async update(brand = {}) {
    logger.info(`Updating brand...`);
    const name = brand.name || this.name;
    const description = brand.description || this.description;
    const slug = brand.slug || this.slug || this.#createSlug(name);
    const tags = brand.tags || this.tags;
    const owner = brand.owner || this.owner;
    const logo = brand.logo || this.logo;
    const id = brand.id || this.id;

    brand = await this.find();

    if (brand) {
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
    }
    return null;
  }

  find(brand = {}) {
    logger.info(`Finding brand...`);
    const id = brand.id || this.id;
    const name = brand.name || this.name;
    const slug = brand.slug || this.slug;

    const filters = [id && { id }, name && { name }, slug && { slug }].filter(
      Boolean
    );

    if (filters.length === 0) {
      throw new Error("At least one of id, name or slug must be provided");
    }

    logger.info("Finding brand...");
    return prisma.brand.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    logger.info("Finding brand by id...");
    return prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(
    where = {},
    limit = 10,
    offset = 0,
    orderBy = { items: { _count: "desc" } }
  ) {
    logger.info("Finding brands...");
    return prisma.brand.findMany({
      where,
      select: { ...this.selectedFields, _count: { select: { items: true } } },
      take: limit,
      skip: offset,
      orderBy,
    });
  }

  getTags(
    where = {},
    limit = 4,
    offset = 0,
    orderBy = { brands: { _count: "desc" } }
  ) {
    logger.info("Finding brand tags...");
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
  }

  favorite(user) {
    logger.info("Favoriting brand...");
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
  }

  isFavorite(user) {
    logger.info("Checking is brand is favorited...");
    return prisma.favoriteBrand.findFirst({
      where: {
        userId: user,
        brandId: this.id,
      },
      select: {
        id: true,
      },
    });
  }

  async unfavorite(user) {
    logger.info("Unfavoriting brand...");
    await prisma.favoriteBrand.delete({
      where: {
        userId_brandId: {
          userId: user,
          brandId: this.id,
        },
      },
    });
  }

  upvote(user) {
    logger.info("Upvoting brand...");
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
  }

  isVoted(user) {
    logger.info("Checking if brand is voted...");
    return prisma.brandVote.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  downvote(user) {
    logger.info("Downvoting brand...");
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
  }

  unvote(user) {
    logger.info("Unvoting brand...");
    return prisma.brandVote.delete({
      where: {
        userId_brandId: { brandId: this.id, userId: user },
      },
    });
  }

  isSubscribed(user) {
    logger.info("Checking if subscribed to brand...");
    return prisma.brandSubscription.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  subscribe(user) {
    logger.info("Subscribing to brand...");
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
  }

  unsubscribe(user) {
    logger.info("Unsubscribing from brand...");
    return prisma.brandSubscription.delete({
      where: {
        user: { id: user },
        brand: { id: this.id },
      },
    });
  }

  async delete(user = {}) {
    logger.info("Deleting brand...");
    this.id = user.id || this.id;
    this.email = user.email || this.email;

    user = await this.find();
    if (user)
      return prisma.brand.delete({
        where: {
          id: user.id,
        },
      });

    return null;
  }

  deleteMany(where = {}) {
    logger.info(`Deleting brands...`);
    return prisma.deleteMany({
      where,
    });
  }
}

const brand = new Brand();
module.exports = { brand, Brand };
