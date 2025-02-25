const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createStyle = async (req, res) => {
  let { name, description, collection, tags } = req.body;

  if (!name || !description)
    return res
      .status(400)
      .json({ message: "name and description is required" });

  collection = await prisma.collection.findUnique({
    where: { id: collection },
    select: { id: true },
  });

  if (!collection)
    return res.status(404).json({ message: "Collection not found" });

  if (!!tags && !Array.isArray(tags))
    return res.status(400).json({ message: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const style = await prisma.style.create({
    data: {
      name: name || undefined,
      description: description || undefined,
      ...(!!tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      collection: {
        connect: {
          id: collection.id,
        },
      },
      author: {
        connect: {
          id: req.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      tags: { select: { name: true } },
      collection: {
        select: {
          name: true,
        },
      },
      author: {
        select: { name: true },
      },
    },
  });

  res.status(201).json({ style });
};

exports.getAllStyle = async (req, res) => {
  const styles = await prisma.style.findMany({
    // Should fix
    // where: {
    //   published: true,
    // },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: { select: { name: true } },
      collection: {
        select: {
          name: true,
        },
      },
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!styles.length)
    return res.status(404).json({ message: "No style found" });

  res.status(200).json({ styles });
};

exports.getStyle = async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      author: { id: req.user.id },
    },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: { select: { name: true } },
      collection: {
        select: {
          name: true,
        },
      },
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!styles.length)
    return res.status(404).json({ message: "No style found" });

  res.status(200).json({ styles });
};

exports.getStyleById = async (req, res) => {
  const style = await prisma.style.findUnique({
    where: {
      id: req.params.style,
    },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      items: true,
      tags: { select: { name: true } },
      collection: {
        select: {
          name: true,
        },
      },
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!style) return res.status(404).json({ message: "No style found" });

  res.status(200).json({ style });
};

exports.createComment = async (req, res) => {
  const entity = "STYLE";
  let { content, tags } = req.body;

  const style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  if (!content) return res.status(400).json({ message: "Comment required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ message: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const comment = await prisma.comment.create({
    data: {
      content,
      entity,
      entityId: req.params.style,
      ...(!!tags &&
        tags.length > 0 && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      author: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  res.status(201).json({ comment });
};

exports.createCommentComment = async (req, res) => {
  const entity = "STYLE";
  let { content, tags } = req.body;

  let style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ message: req.params.style });

  if (!content) return res.status(400).json({ message: "No comment provided" });

  if (tags && !Array.isArray(tags))
    return res.status(402).json({ message: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let comment = await prisma.comment.findUnique({
    where: {
      entity: entity,
      entityId: req.params.style,
      id: req.params.comment,
    },
  });

  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment = await prisma.comment.create({
    data: {
      content: content,
      ...(!!tags &&
        tags.length > 0 && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      authorId: req.user.id,
      entity: entity,
      entityId: req.params.style,
      parentId: req.params.comment,
    },
  });

  res.status(201).json({ comment });
};

exports.getStyleComment = async (req, res) => {
  const entity = "STYLE";
  const comments = await prisma.comment.findMany({
    where: {
      entity: entity,
      entityId: req.params.style,
    },
    select: {
      id: true,
      content: true,
      entity: true,
      entityId: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      replies: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (comments.length < 1)
    return res.status(404).json({ message: "No comment found" });

  res.status(200).json({ comments });
};

exports.deleteComment = async (req, res) => {
  let comment = await prisma.comment.findFirst({
    where: { id: req.params.comment },
  });

  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment = await prisma.comment.delete({
    where: { id: req.params.comment, authorId: req.user.id },
  });

  res.status(204).end();
};

exports.updateStyle = async (req, res) => {
  let { name, description, items, tags } = req.body;

  if (!name && !description)
    return res
      .status(400)
      .json({ message: "Name and description is required" });

  if (items && !Array.isArray(items))
    return res.status(400).json({ message: "Items must be an array" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ message: "Tags must be an array" });

  tags = tags
    .map((tag) => tag.trim().toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: {
      name,
      description,
      items: {
        deleteMany: {},
        create: items.map((itemId) => ({
          items: { connect: { id: itemId } },
        })),
      },
      ...(tags.length > 0 && {
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  res.status(200).json({ style });
};

exports.favoriteStyle = async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
    select: {
      id: true,
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  const favorite = await prisma.favoriteStyle.upsert({
    where: {
      userId_styleId: {
        userId: req.user.id,
        styleId: style.id,
      },
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      style: {
        connect: {
          id: req.params.style,
        },
      },
    },
    update: {},
    select: {
      id: true,
    },
  });

  res.status(201).json({ favorite });
};

exports.unfavoriteStyle = async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  let favorite = await prisma.favoriteStyle.findFirst({
    where: {
      userId: req.user.id,
      styleId: style.id,
    },
  });

  if (!favorite)
    return res.status(404).json({ message: "Style is not favorited" });

  await prisma.favoriteStyle.delete({
    where: {
      userId_styleId: {
        userId: favorite.userId,
        styleId: favorite.styleId,
      },
    },
  });

  res.status(204).end();
};

exports.upvoteStyle = async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  const upvote = await prisma.styleVote.upsert({
    where: {
      userId_styleId: {
        styleId: req.params.style,
        userId: req.user.id,
      },
    },
    update: {
      vote: 1,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      style: {
        connect: {
          id: req.params.style,
        },
      },
      vote: 1,
    },
  });

  res.status(200).json({ upvote });
};

exports.downvoteStyle = async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  const downvote = await prisma.styleVote.upsert({
    where: {
      userId_styleId: {
        styleId: req.params.style,
        userId: req.user.id,
      },
    },
    update: {
      vote: -1,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      style: {
        connect: {
          id: req.params.style,
        },
      },
      vote: -1,
    },
  });

  res.status(200).json({ downvote });
};

exports.unvoteStyle = async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  const vote = await prisma.styleVote.findFirst({
    where: {
      styleId: style.id,
      userId: req.user.id,
    },
  });

  if (!vote) return res.status(404).json({ message: "Vote not found" });

  await prisma.styleVote.delete({
    where: {
      userId_styleId: {
        styleId: style.id,
        userId: req.user.id,
      },
    },
  });

  res.status(204).end();
};

exports.publishStyle = async (req, res) => {
  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: { published: true },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  res.status(200).json({ style });
};

exports.unpublishStyle = async (req, res) => {
  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: { published: false },
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  res.status(200).json({ style });
};

exports.deleteStyle = async (req, res) => {
  let style = await prisma.style.findFirst({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ message: style });

  style = await prisma.style.delete({
    where: { id: req.params.style, authorId: req.user.id },
  });

  res.status(204).end();
};
