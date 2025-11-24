const express = require("express");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { users } = require("../utils/user");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { items } = require("../utils/item");
const { status } = require("http-status");
const auth = require("../middleware/auth");
const router = express.Router();

const models = { brands, items, collections, styles, users, comments };

router.put("/:model/:id/upvote", auth, async (req, res) => {
  const model = req.params.model;
  const valid = ["brands", "items", "collections", "styles", "comments"];
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
      .json({ message: status[status.NOT_FOUND], error: true });

  const response = await Model.upvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.get("/:model/:id/upvote", async (req, res) => {
  const model = req.params.model;
  const valid = ["brands", "items", "collections", "styles", "comments"];
  const Model = models[req.params.model];

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], count: 0, error: true });

  Model.id = req.params.id;
  const find = await Model.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], count: 0, error: true });

  const count = await Model.upvoteCount();

  return res
    .status(status.NOT_FOUND)
    .json({ message: status[status.NOT_FOUND], count });
});

router.get("/:model/:id/downvote", async (req, res) => {
  const model = req.params.model;
  const valid = ["brands", "items", "collections", "styles", "comments"];
  const Model = models[req.params.model];

  if (!valid.includes(model))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], count: 0, error: true });

  Model.id = req.params.id;
  const find = await Model.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], count: 0, error: true });

  const count = await Model.downvoteCount();

  return res
    .status(status.NOT_FOUND)
    .json({ message: status[status.NOT_FOUND], count });
});

router.put("/:model/:id/downvote", auth, async (req, res) => {
  const model = req.params.model;
  const valid = ["brands", "items", "collections", "styles", "comments"];
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

  const response = await Model.downvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: response });
});

router.delete("/:model/:id", auth, async (req, res) => {
  const model = req.params.model;
  const valid = ["brands", "items", "collections", "styles", "comments"];
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
      .json({ message: status[status.NOT_FOUND], error: true });

  const voted = await Model.isVoted(req.user.id);

  if (!voted)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unvote(req.user.type_id);

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
