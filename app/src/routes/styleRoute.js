const express = require("express");
const { styles } = require("../utils/Style");
const { collections } = require("../utils/Collection");
const { comments } = require("../utils/Comment");
const auth = require("../middleware/auth");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  collections.id = req.body.collection;
  const isCollection = await collections.find();

  if (req.body.collection && !isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  styles.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  styles.name = req.body.name;
  styles.description = req.body.description;
  styles.author = req.user.id;
  const response = await styles.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.get("/", async (req, res) => {
  const sort = req.query.sort;
  const brand = req.query.brand;
  const gender = req.query.gender;
  const color = req.query.color;
  const releaseYear = req.query.releaseYear;
  const tag = req.query.tag;
  const limit = Number(req.query.limit) || undefined;
  const offset = Number(req.query.offset) || undefined;
  const popular = { favoritedBy: { _count: "desc" } };
  const newest = { releaseYear: "desc" };
  const latest = { createdAt: "desc" };

  const order =
    sort === "newest" ? newest : sort === "latest" ? latest : popular;

  const filter = {
    AND: [
      brand && {
        items: {
          brand: { name: { contains: brand, lte: "insensitive" } },
        },
      },
      gender && {
        gender: gender.toUpperCase(),
      },
      color && {
        items: {
          color,
          _count: "desc",
        },
      },
      releaseYear && {
        releaseYear: Number(releaseYear),
      },
      tag && {
        tags: {
          some: {
            name: {
              contains: tag,
              lte: "insensitive",
            },
          },
        },
      },
    ].filter(Boolean),
  };

  const data = await styles.findMany(filter, limit, offset, order);

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], styles: [] });

  const count = await styles.count(filter);
  return res
    .status(status.OK)
    .json({ message: status[status.OK], styles: data, count });
});

router.get("/count", async (req, res) => {
  const count = await styles.count();
  res.status(status.OK).json({ message: status[status.OK], count });
});

router.get("/tags", async (req, res) => {
  const tags = await styles.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/me", auth, async (req, res) => {
  const data = await styles.findMany({ authorId: req.user.id });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], styles: data });
});

router.get("/:style", async (req, res) => {
  styles.id = req.params.style;
  const find = await styles.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], style: find });
});

router.post("/:style/comment", async (req, res) => {
  styles.id = req.params.style;
  let find = await styles.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  comments.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  comments.content = req.body.content;
  comments.entity = ENTITY;
  comments.entityId = req.params.style;
  comments.userId = req.user.id;
  const comment = await comments.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], comment });
});

router.post("/:style/comment/:comment", async (req, res) => {
  styles.id = req.params.style;
  const find = await styles.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  comments.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  comments.id = req.params.comment;

  const data = await comments.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  comments.content = req.body.content;
  comments.tags = req.body.tags;
  comments.entity = ENTITY;
  comments.entityId = req.params.style;
  comments.userId = req.user.id;
  comments.parent = req.params.comment;
  const response = await comments.create();

  return res
    .status(status.CREATED)
    .json({ message: status[status.NOT_FOUND], response });
});

router.get("/:style/comments", async (req, res) => {
  const data = await comments.findMany({ entityId: req.params.style });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], comments: data });
});

router.delete("/comment/:comment", async (req, res) => {
  const data = await comments.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await comments.delete();

  return res.status(status.NO_CONTENT).end();
});

router.patch("/:style", async (req, res) => {
  if (!req.body.name && !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.items && !Array.isArray(req.body.items))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  styles.name = req.body.name;
  styles.description = req.body.description;
  styles.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  styles.id = req.params.style;
  const isStyle = await styles.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await style.save();

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.post("/:style/favorite", auth, async (req, res) => {
  styles.id = req.params.style;
  const data = await styles.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await styles.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.delete("/:style/unfavorite", auth, async (req, res) => {
  styles.id = req.params.style;
  const data = await styles.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isFavorited = await styles.isFavorited(req.user.id);

  if (!isFavorited)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await styles.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.put("/:style/upvote", async (req, res) => {
  styles.id = req.params.style;
  const data = await styles.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const upvote = await styles.upvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], upvote });
});

router.put("/:style/downvote", async (req, res) => {
  styles.id = req.params.style;
  let styleExists = await styles.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const downvote = await styles.downvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], downvote });
});

router.delete("/:style/unvote", async (req, res) => {
  styles.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });
  const vote = await styles.isVoted(req.user.id);

  if (!vote)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await styles.unvote(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.patch("/:style/publish", async (req, res) => {
  styles.id = req.params.style;
  const isStyle = await styles.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const response = await styles.save({ published: true });

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.patch("/:style/unpublish", async (req, res) => {
  styles.id = req.params.style;
  const isStyle = await styles.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await styles.save({ published: false });

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:style", async (req, res) => {
  styles.id = req.params.style;
  const isStyle = await styles.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await styles.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
