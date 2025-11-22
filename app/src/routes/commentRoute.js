const express = require("express");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { users } = require("../utils/user");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { items } = require("../utils/item");
const { status } = require("http-status");
const transform = require("../functions/transform");
const auth = require("../middleware/auth");
const router = express.Router();

const models = { brands, items, collections, styles, users, comments };

router.post("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "styles", "collections"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.type_id;
  const find = await Model.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  comments.content = req.body.content;
  comments.userId = req.user.id;
  comments.entity = type;
  comments.entityId = req.params.type_id;
  comments.tags = req.body.tags && req.body.tags.map((tag) => transform(tag));

  const created = await comments.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], created });
});

router.post("/:type/:type_id/:comment", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "styles", "collections"];
  const Model = models[req.params.type];

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.id;
  let find = await Model.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  comments.id = req.params.comment;
  find = await comments.find();

  if (!find)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      data: {},
    });

  comments.content = req.body.content;
  comments.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  comments.userId = req.user.id;
  comments.entity = ENTITY;
  comments.entityId = brands.id;
  comments.parent = req.params.comment;
  comments = await comments.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: comment });
});

router.get("/:comment", async (req, res) => {
  comments.id = req.params.comment;
  const find = await comments.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], comment: find });
});

router.get("/:type/all", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "styles", "collections"];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const data = await comments.findMany({
    where: { entity: type.toUpperCase },
  });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], comments: data });
});

router.patch("/:comment", async (req, res) => {
  comments.id = req.params.comment;
  const find = await comments.find();

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

  comments.content = req.body.content;
  comments.userId = req.user.id;
  comments.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  const created = await comments.save();

  return res.status(status.OK).json({ message: status[status.OK], created });
});

router.delete("/:comment", auth, async (req, res) => {
  comments.id = req.params.comment;
  const find = await comments.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await comments.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
