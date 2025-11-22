const express = require("express");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { users } = require("../utils/user");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { items } = require("../utils/item");
const { status } = require("http-status");
const router = express.Router();

const models = { brands, items, collections, styles, users, comments };

router.put("/:type/:type_id/upvote", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "collections", "styles", "comments"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.type_id;
  const isExist = await Model.find();

  if (!isExist)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  Model.id = req.params.type_id;
  const response = await Model.upvote(req.user.id);

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.put("/:type/:type_id/downvote", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "collections", "styles", "comments"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.type_id;
  const isExist = await Model.find();

  if (!isExist)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  Model.id = req.params.type_id;
  const response = await Model.downvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: response });
});

router.delete("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "collections", "styles", "comments"];
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
