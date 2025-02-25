const prisma = require("../functions/prisma");

class Item {
  constructor(item = {}) {
    this.item = {};
    this.id = item.id || null;
    this.name = item.name || null;
    this.description = item.description || null;
    this.images = item.images || null;
    this.tags = item.tags || null;
    this.brand = item.brand || null;
    this.userId = item.userId || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      images: true,
      tags: true,
      creator: { select: { id: true } },
    };
  }

  async save(item = {}) {
    this.name = item.name || this.name;
    this.description = item.description || this.description;
    this.tags = item.tags || this.tags;
    this.id = item.id || this.id;
    this.brand = item.brand || this.brand;
    this.images = item.images || this.images;
    this.creator = item.creator || this.creator;

    item = await this.find();

    return item ? this.update({ id: item.id }) : this.create();
  }

  async create(item = {}) {
    const name = item.name || this.name;
    const description = item.description || this.description;
    const tags = item.tags || this.tags;
    const brand = item.brand || this.brand;
    const images = item.images || this.images;
    const creator = item.creator || this.creator;

    item = await prisma.item.create({
      data: {
        name,
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
        ...(images && {
          images: {
            connect: images.map((image) => ({
              id: image,
            })),
          },
        }),
        brand: {
          connectOrCreate: {
            where: { name: brand },
            create: { name: brand },
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
    const description = item.description || this.description;
    const tags = item.tags || this.tags;
    const brand = item.brand || this.brand;
    const images = item.images || this.images;
    const creator = item.creator || this.creator;

    return prisma.item.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
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
                connect: images.map((image) => ({
                  id: image,
                })),
              },
            }
          : {}),
        ...(brand
          ? {
              brand: {
                connectOrCreate: {
                  where: { name: brand },
                  create: { name: brand },
                },
              },
            }
          : {}),
      },
      select: this.selectedFields,
    });
  }

  find(item = {}) {
    const id = item.id || this.id;
    const name = item.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

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

  findMany(where = {}) {
    return prisma.item.findMany({
      where,
      select: this.selectedFields,
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

  isFavorited(user) {
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

  delete(id = this.id) {
    return prisma.item.delete({
      where: {
        id,
      },
    });
  }

  deleteMany() {
    return prisma.item.deleteMany();
  }
}

module.exports = Item;
