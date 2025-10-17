const express = require("express");
const { item } = require("../utils/Item");
const { user } = require("../utils/User");
const logger = require("../utils/Logger");
const auth = require("../middleware/auth");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

router.post("/", auth, async (req, res) => {
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
    user.id = req.body.creator;
    const creator = await user.find({ id: req.body.creator });

    if (!creator)
      return res
        .status(status.NOT_FOUND)
        .json({ message: status[status.NOT_FOUND], data: {} });

    item.creator = creator.id;
  }

  item.images = req.body.images;
  item.name = req.body.name;
  item.description = req.body.description;
  item.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  item.brand = transform(req.body.brand);
  const response = await item.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: response });
});

router.get("/", async (req, res) => {
  const filter = req.params.filter || undefined;
  const limit = Number(req.params.limit) || undefined;
  const offset = Number(req.params.offset) || undefined;
  const order = req.params.order || undefined;
  const items = await item.findMany(filter, limit, offset, order);

  if (!items.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], items });
});

router.get("/tags", async (req, res) => {
  const tags = await item.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/:item([a-zA-Z0-9_-]+)", async (req, res) => {
  item.id = req.params.item;
  const data = await item.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], item });
});

// router.post("/:item/favorite", async (req, res) => {
//   item.id = req.params.item;
//   let itemExists = await item.find();

//   if (!itemExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   const favorite = await item.favorite(req.user.id);

//   res
//     .status(status.CREATED)
//     .json({ message: status[status.CREATED], data: favorite });
// });

// router.delete("/:item/unfavorite", async (req, res) => {
//   item.id = req.params.item;
//   let itemExists = await item.find();

//   if (!itemExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   let favorite = await item.isFavorited(req.user.id);

//   if (!favorite)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], data: {} });

//   await item.unfavorite(req.user.id);

//   res.status(status.NO_CONTENT).end();
// });

// router.put("/:item/upvote", async (req, res) => {
//   item.id = req.params.item;
//   let itemExists = await item.find();

//   if (!itemExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   const upvote = await item.upvote(req.user.id);

//   res.status(status.OK).json({ message: status[status.OK], data: upvote });
// });

// router.put("/:item/downvote", async (req, res) => {
//   item.id = req.params.item;
//   let itemExists = await item.find();

//   if (!itemExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   const downvote = await item.downvote(req.user.id);

//   res.status(status.OK).json({ message: status.OK, data: downvote });
// });

// router.delete("/:item/unvote", async (req, res) => {
//   item.id = req.params.item;
//   let itemExists = await item.find();

//   if (!itemExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   await item.unvote(req.user.id);

//   res.status(status.NO_CONTENT).end();
// });

router.patch("/:item", async (req, res) => {
  logger.info("Update item by id route");

  if (
    req.body.images &&
    (!Array.isArray(req.body.images) || req.body.images.length === 0)
  ) {
    logger.error("No image included in request");
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status.BAD_REQUEST, error: true });
  }

  if (req.body.tags && !Array.isArray(req.body.tags)) {
    logger.error("No tags included in this request");
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });
  }

  let itemData = { ...req.body };

  if (!!req.body.tags && req.body.tags.length > 0) {
    logger.info("Parsing tags");
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );
  }

  // logger.info(req.params.item);

  item.id = req.params.item;
  let itemExists = await item.find();

  logger.info(itemExists);

  if (!itemExists) {
    logger.error("Item not found");
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });
  }

  const response = await item.save(itemData);

  logger.info("Returning response...");
  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: response });
});

router.delete("/:item", async (req, res) => {
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await item.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
