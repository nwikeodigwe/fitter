const prisma = require("../functions/prisma");

class Comment {
  constructor(comment = {}) {
    this.id = comment.id || undefined;
    this.content = comment.content || undefined;
    this.entity = comment.entity || undefined;
    this.entityId = comment.entityId || undefined;
    this.tags = comment.tags || undefined;
    this.userId = comment.userId || undefined;
    this.parent = comment.parenr || undefined;
    this.selectedFields = {
      id: true,
      author: { select: { id: true, name: true } },
      content: true,
    };
  }

  async save(comment = {}) {
    this.id = comment.id || this.id;
    this.content = comment.content || this.content;
    this.entity = comment.entity || this.entity;
    this.tags = comment.tags || this.tags;
    this.userId = comment.userId || this.userId;
    this.entityId = comment.entityId || this.entityId;
    this.parent = comment.parent || this.parent;

    comment = await this.find();

    return comment ? this.update() : this.create();
  }

  async create(comment = {}) {
    const content = comment.content || this.content;
    const entity = comment.entity || this.entity;
    const tags = comment.tags || this.tags;
    const userId = comment.userId || this.userId;
    const entityId = comment.entityId || this.entityId;
    const parent = comment.parent || this.parent;

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
        ...(parent && {
          parent: { connect: { id: parent } },
        }),
      },
      select: this.selectedFields,
    });

    this.id = comment.id;
    return comment;
  }

  update(comment = {}) {
    const content = comment.content || this.content;
    const tags = comment.tags || this.tags;

    return prisma.comment.update({
      where: {
        id: this.id,
      },
      data: {
        ...(content && { content }),
        ...(tags && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      select: this.selectedFields,
    });
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

  async delete(user = {}) {
    this.id = user.id || this.id;
    user = await this.find();
    if (user)
      return prisma.comment.delete({
        where: {
          id: user.id,
        },
      });
    return null;
  }
}

module.exports = Comment;
