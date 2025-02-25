const express = require("express");
const Item = require("../utils/Item");
const User = require("../utils/User");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (!Array.isArray(req.body.images) || req.body.images.length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (!req.body.brand)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.creator) {
    let creator = new User();
    creator = await creator.find({ id: req.body.creator });

    if (!creator)
      return res
        .status(status.NOT_FOUND)
        .json({ message: status[status.NOT_FOUND], data: {} });

    item.creator = creator.id;
  }

  let item = new Item();
  item.images = req.body.images;
  item.name = req.body.name;
  item.description = req.body.description;
  item.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  item.brand = transform(req.body.brand);
  item = await item.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: item });
});

router.get("/", async (req, res) => {
  let items = new Item();
  items = await items.findMany();

  if (!items.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], data: items });
});

router.get("/:item", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  item = await item.find();

  if (!item)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], data: item });
});

router.post("/:item/favorite", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const favorite = await item.favorite(req.user.id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: favorite });
});

router.delete("/:item/unfavorite", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await item.isFavorited(req.user.id);

  if (!favorite)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  await item.unfavorite(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.put("/:item/upvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const upvote = await item.upvote(req.user.id);

  res.status(status.OK).json({ message: status[status.OK], data: upvote });
});

router.put("/:item/downvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const downvote = await item.downvote(req.user.id);

  res.status(status.OK).json({ message: status.OK, data: downvote });
});

router.delete("/:item/unvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await item.unvote(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.patch("/:item", async (req, res) => {
  if (
    req.body.images &&
    (!Array.isArray(req.body.images) || req.body.images.length === 0)
  )
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status.BAD_REQUEST, data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let itemData = { ...req.body };

  if (!!req.body.tags && req.body.tags.length > 0)
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  item = await item.save(itemData);

  res.status(status.OK).json({ message: status[status.OK], data: item });
});

router.delete("/:item", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await item.delete();

  res.status(status.NO_CONTENT).end();
});

module.exports = router;
