const prisma = require("../functions/prisma");
const { logger } = require("./logger");

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
    try {
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
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async update(comment = {}) {
    try {
      const content = comment.content || this.content;
      const tags = comment.tags || this.tags;

      comment = await this.find();

      if (!comment) return;

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
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  find(id = this.id) {
    try {
      return prisma.comment.findFirst({
        where: { id },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  findMany(where = {}) {
    try {
      return prisma.comment.findMany({
        where,
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  upvote(user) {
    try {
      return prisma.commentVote.upsert({
        where: {
          userId_commentId: { commentId: this.id, userId: user },
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
          comment: {
            connect: {
              id: this.id,
            },
          },
          vote: true,
        },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  isVoted(user) {
    try {
      return prisma.commentVote.findFirst({
        where: {
          commentId: this.id,
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
      return prisma.commentVote.upsert({
        where: {
          userId_commentId: { commentId: this.id, userId: user },
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
          comment: {
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
      return prisma.commentVote.delete({
        where: {
          userId_commentId: { commentId: this.id, userId: user },
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

      return prisma.comment.delete({
        where: {
          id: user.id,
        },
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async deleteMany(where = {}) {
    try {
      return prisma.comment.deleteMany({
        where,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

const comments = new Comment();
module.exports = { comments, Comment };
