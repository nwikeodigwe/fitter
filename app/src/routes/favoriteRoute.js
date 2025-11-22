const express = require("express");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { users } = require("../utils/user");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { items } = require("../utils/item");
const { status } = require("http-status");
const router = express.Router();

const models = { brands, items, collections, styles };
const valid = ["brands", "items", "styles", "collections"];

router.post("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
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

  await Model.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], favorite: true });
});

router.get("/:type/:type_id/favorited", async (req, res) => {
  const type = req.params.type;
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.type_id;
  const favorited = await Model.isFavorite(req.user.type_id);

  if (!favorited)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.OK], favorited: false });

  return res
    .status(status.CREATED)
    .json({ message: status[status.OK], favorited: true });
});

router.delete("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
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

  const favorited = await Model.isFavorite(req.user.id);

  if (!favorited)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
