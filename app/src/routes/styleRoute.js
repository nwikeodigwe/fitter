const express = require("express");
const Style = require("../utils/Style");
const Collection = require("../utils/Collection");
const Comment = require("../utils/Comment");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

const ENTITY = "STYLE";

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let collection = new Collection();
  collection.id = req.body.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let style = new Style();
  style.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  style.name = req.body.name;
  style.description = req.body.description;
  style.author = req.user.id;
  style = await style.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: style });
});

router.get("/", async (req, res) => {
  let styles = new Style();
  styles = await styles.findMany();

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: styles });
});

router.get("/me", async (req, res) => {
  let styles = new Style();
  styles = await styles.findMany({ authorId: req.user.id });

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: styles });
});

router.get("/:style", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  style = await style.find();

  if (!style)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ style });
});

router.post("/:style/comment", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let comment = new Comment();
  comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  comment.content = req.body.content;
  comment.entity = ENTITY;
  comment.entityId = req.params.style;
  comment.userId = req.user.id;
  comment = await comment.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: comment });
});

router.post("/:style/comment/:comment", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let comment = new Comment();

  comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  comment.id = req.params.comment;

  let commentExists = await comment.find();

  if (!commentExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  comment.content = req.body.content;
  comment.tags = req.body.tags;
  comment.entity = ENTITY;
  comment.entityId = req.params.style;
  comment.userId = req.user.id;
  comment.parent = req.params.comment;
  comment = await comment.create();

  return res
    .status(status.CREATED)
    .json({ message: status[status.NOT_FOUND], data: comment });
});

router.get("/:style/comments", async (req, res) => {
  let comments = new Comment();
  comments = await comments.findMany({ entityId: req.params.style });

  if (comments.length < 1)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: comments });
});

router.delete("/comment/:comment", async (req, res) => {
  let comment = new Comment();
  comment.id = req.params.comment;
  let commentExists = await comment.find();

  if (!commentExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await comment.delete();

  return res.status(status.NO_CONTENT).end();
});

router.patch("/:style", async (req, res) => {
  if (!req.body.name && !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.items && !Array.isArray(req.body.items))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let style = new Style();
  style.name = req.body.name;
  style.description = req.body.description;
  style.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  style = await style.save(styleData);

  return res
    .status(status.OK)
    .json({ message: status[status.BAD_REQUEST], data: style });
});

router.post("/:style/favorite", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const favorite = await style.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: favorite });
});

router.delete("/:style/unfavorite", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await style.isFavorited(req.user.id);

  if (!favorite)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await style.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.put("/:style/upvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const upvote = await style.upvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: upvote });
});

router.put("/:style/downvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const downvote = await style.downvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: downvote });
});

router.delete("/:style/unvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });
  const vote = await style.isVoted(req.user.id);

  if (!vote)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await style.unvote(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.patch("/:style/publish", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  style = await style.save({ published: true });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: style });
});

router.patch("/:style/unpublish", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  style = await style.save({ published: false });

  return res
    .status(status.OK)
    .json({ message: status[status.NOT_FOUND], data: style });
});

router.delete("/:style", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await style.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
