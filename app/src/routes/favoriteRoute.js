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

router.post("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "styles", "collections"];
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

  await Model.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], favorite: true });
});

router.delete("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "items", "styles", "collections"];
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

  const isFavorite = await Model.isFavorite(req.user.type_id);

  if (!isFavorite)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
