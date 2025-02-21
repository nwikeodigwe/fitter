const prisma = require("../functions/prisma");

class Brand {
  constructor(brand = {}) {
    this.id = brand.id || null;
    this.name = brand.name || null;
    this.description = brand.description || null;
    this.tags = brand.tags || [];
    this.logo = brand.logo || null;
    this.owner = brand.owner || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { id: true, name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    };
  }

  async save(brand = {}) {
    this.name = brand.name || this.name;
    this.description = brand.description || this.description;
    this.tags = brand.tags || this.tags;
    this.owner = brand.owner || this.owner;
    this.logo = brand.logo || this.logo;
    this.id = brand.id || this.id;

    brand = await this.find({ id: this.id, name: this.name });

    return brand ? this.update({ id: brand.id }) : this.create();
  }

  async create(brand = {}) {
    const name = brand.name || this.name;
    const description = brand.description || this.description;
    const tags = brand.tags || this.tags;
    const owner = brand.owner || this.owner;
    const logo = brand.logo || this.logo;

    brand = await prisma.brand.create({
      data: {
        name,
        description,
        ...(logo ? { logo: { connect: { id: logo } } } : {}),
        ...(tags
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
    });

    this.id = brand.id;
    return brand;
  }

  update(brand = {}) {
    const name = brand.name || this.name;
    const description = brand.description || this.description;
    const tags = brand.tags || this.tags;
    const owner = brand.owner || this.owner;
    const logo = brand.logo || this.logo;
    const id = brand.id || this.id;

    return prisma.brand.update({
      where: {
        id,
        ownerId: owner,
      },
      data: {
        ...(name ? { name } : {}),
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
    });
  }

  find(brand = {}) {
    const id = brand.id || this.id;
    const name = brand.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.brand.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}) {
    return prisma.brand.findMany({
      where,
      select: this.selectedFields,
    });
  }

  favorite(user) {
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

  isFavorited(user) {
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
    return prisma.brandVote.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  downvote(user) {
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
    return prisma.brandVote.delete({
      where: {
        userId_brandId: { brandId: this.id, userId: user },
      },
    });
  }

  isSubscribed(user) {
    return prisma.brandSubscription.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  subscribe(user) {
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

  unsubscribe(id) {
    return prisma.brandSubscription.delete({
      where: {
        id,
      },
    });
  }

  delete(id = this.id) {
    return prisma.brand.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = Brand;
