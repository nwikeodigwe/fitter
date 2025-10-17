const express = require("express");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { comment } = require("../utils/Comment");
const auth = require("../middleware/auth");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

const ENTITY = "STYLE";

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  collection.id = req.body.collection;
  const isCollection = await collection.find();

  if (req.body.collection && !isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  style.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  style.name = req.body.name;
  style.description = req.body.description;
  style.author = req.user.id;
  const response = await style.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.get("/", async (req, res) => {
  const styles = await style.findMany();

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], styles });
});

router.get("/tags", async (req, res) => {
  const tags = await style.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/me", auth, async (req, res) => {
  const styles = await style.findMany({ authorId: req.user.id });

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], styles });
});

router.get("/:style", async (req, res) => {
  style.id = req.params.style;
  data = await style.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], data });
});

router.post("/:style/comment", async (req, res) => {
  style.id = req.params.style;
  let isStyle = await style.find();

  if (!style)
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

  comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  comment.content = req.body.content;
  comment.entity = ENTITY;
  comment.entityId = req.params.style;
  comment.userId = req.user.id;
  const response = await comment.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.post("/:style/comment/:comment", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
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

  comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  comment.id = req.params.comment;

  const isComment = await comment.find();

  if (!isComment)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  comment.content = req.body.content;
  comment.tags = req.body.tags;
  comment.entity = ENTITY;
  comment.entityId = req.params.style;
  comment.userId = req.user.id;
  comment.parent = req.params.comment;
  const response = await comment.create();

  return res
    .status(status.CREATED)
    .json({ message: status[status.NOT_FOUND], response });
});

router.get("/:style/comments", async (req, res) => {
  const comments = await comments.findMany({ entityId: req.params.style });

  if (!comments.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], comments });
});

router.delete("/comment/:comment", async (req, res) => {
  const isComment = await comment.find();

  if (!isComment)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await comment.delete();

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

  style.name = req.body.name;
  style.description = req.body.description;
  style.tags = req.body.tags.map((tag) => transform(tag)) || undefined;

  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await style.save();

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.post("/:style/favorite", auth, async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await style.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.delete("/:style/unfavorite", auth, async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isFavorited = await style.isFavorited(req.user.id);

  if (!isFavorited)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await style.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.put("/:style/upvote", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!style)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const upvote = await style.upvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], upvote });
});

router.put("/:style/downvote", async (req, res) => {
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const downvote = await style.downvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], downvote });
});

router.delete("/:style/unvote", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });
  const vote = await style.isVoted(req.user.id);

  if (!vote)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await style.unvote(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.patch("/:style/publish", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const response = await style.save({ published: true });

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.patch("/:style/unpublish", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await style.save({ published: false });

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:style", async (req, res) => {
  style.id = req.params.style;
  const isStyle = await style.find();

  if (!isStyle)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await style.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
