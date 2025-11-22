const express = require("express");
const { brands } = require("../utils/Brand");
const { comments } = require("../utils/Comment");
const { users } = require("../utils/User");
const { styles } = require("../utils/Style");
const { collections } = require("../utils/Collection");
const { items} = require("../utils/Item");
// const { logger } = require("../utils/Logger");
const { status } = require("http-status");
// const transform = require("../functions/transform");
// const auth = require("../middleware/auth");
const router = express.Router();

const models = { brands, items, collections, styles, users, comments };

router.put("/upvote/:type/:type_id", async (req, res) => {
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

router.put("/downvote/:type/:type_id", async (req, res) => {
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

router.delete("/unvote/:type/:type_id", async (req, res) => {
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

  const isVoted = await Model.isVoted(req.user.id);

  if (!isVoted)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unvote(req.user.type_id);

  return res.status(status.NO_CONTENT).end();
});

router.post("/subscribe/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "users"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.id;
  const isExist = await Model.find();

  if (!isExist)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isSubscribed = await Model.isSubscribed(req.user.id);

  if (isSubscribed)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT], error: true });

  const response = await Model.subscribe(req.user.type_id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.delete("/unsubscribe/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "users"];
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

  const isSubscribed = await Model.isSubscribed(req.user.type_id);

  if (!isSubscribed)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unsubscribe(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.post("/favorite/:type/:type_id", async (req, res) => {
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

router.delete("/unfavorite/:type/:type_id", async (req, res) => {
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
