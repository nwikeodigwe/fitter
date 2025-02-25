const prisma = require("../functions/prisma");

class Comment {
  constructor(comment = {}) {
    this.id = comment.id || null;
    this.content = comment.content || null;
    this.entity = comment.entity || null;
    this.entityId = comment.entityId || null;
    this.tags = comment.tags || null;
    this.userId = comment.userId || null;
    this.selectedFields = {
      id: true,
      author: { select: { id: true, name: true } },
      content: true,
    };
  }

  async save(comment = {}) {
    const content = comment.content || this.content;
    const entity = comment.entity || this.entity;
    const tags = comment.tags || this.tags;
    const userId = comment.userId || this.userId;
    const entityId = comment.entityId || this.entityId;

    comment = await prisma.comment.create({
      data: {
        content,
        ...(tags && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
        author: {
          connect: {
            id: userId,
          },
        },
        entity,
        entityId,
        ...(this.id && {
          parent: { connect: { id: this.id } },
        }),
      },
      select: this.selectedFields,
    });

    this.id = comment.id;
    return comment;
  }

  async create(comment = {}) {
    const content = comment.content || this.content;
    const entity = comment.entity || this.entity;
    const tags = comment.tags || this.tags;
    const userId = comment.userId || this.userId;
    const entityId = comment.entityId || this.entityId;

    comment = await prisma.comment.create({
      data: {
        content,
        ...(tags && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
        author: {
          connect: {
            id: userId,
          },
        },
        entity,
        entityId,
        ...(this.id && {
          parent: { connect: { id: this.id } },
        }),
      },
      select: this.selectedFields,
    });

    this.id = comment.id;
    return comment;
  }

  find(id = this.id) {
    return prisma.comment.findFirst({
      where: { id },
      select: this.selectedFields,
    });
  }

  findMany(where = {}) {
    return prisma.comment.findMany({
      where,
      select: this.selectedFields,
    });
  }

  delete(id = this.id) {
    return prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = Comment;
