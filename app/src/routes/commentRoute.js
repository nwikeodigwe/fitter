const express = require("express");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { items } = require("../utils/item");
const { status } = require("http-status");
const transform = require("../functions/transform");
const auth = require("../middleware/auth");
const router = express.Router();

const models = { brands, items, collections, styles, comments };
const valid = ["brands", "items", "styles", "collections"];

router.post("/:model/:id", auth, async (req, res) => {
  const model = req.params.model;
  const Model = models[req.params.model];

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.id;
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
  comments.model = model.slice(0, -1).toUpperCase();
  comments.modelId = req.params.id;
  comments.tags = req.body.tags && req.body.tags.map((tag) => transform(tag));

  const created = await comments.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], created });
});

router.get("/:model/:id/count", async (req, res) => {
  const model = req.params.model;

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], count: 0, error: true });

  comments.model = model.slice(0, -1).toUpperCase();
  comments.modelId = req.params.id;
  const count = await comments.count();

  return res.status(status.OK).json({ message: status[status.OK], count });
});

router.post("/:model/:id/:comment", auth, async (req, res) => {
  const model = req.params.model;
  const Model = models[req.params.model];

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.id;
  const find = await Model.find();

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
  comments.model = model.slice(0, -1).toUpperCase();
  comments.modelId = req.params.id;
  comments.parent = req.params.comment;
  const response = await comments.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: response });
});

router.get("/:id", async (req, res) => {
  comments.id = req.params.id;
  const find = await comments.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], comment: find });
});

router.get("/:model/:id", async (req, res) => {
  const model = req.params.model;

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const data = await comments.findMany({
    where: { model: model.slice(0, -1).toUpperCase(), modelId: req.params.id },
  });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], comments: data });
});

router.patch("/:id", auth, async (req, res) => {
  comments.id = req.params.id;
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
  const response = await comments.save();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: response });
});

router.delete("/:id", auth, async (req, res) => {
  comments.id = req.params.id;
  const find = await comments.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await comments.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
