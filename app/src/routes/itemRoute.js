const express = require("express");
const { items } = require("../utils/Item");
const { users } = require("../utils/User");
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

  // const item = new Item();
  if (req.body.creator) {
    users.id = req.body.creator;
    const creator = await users.find({ id: req.body.creator });

    if (!creator)
      return res
        .status(status.NOT_FOUND)
        .json({ message: status[status.NOT_FOUND], data: {} });

    items.creator = creator.id;
  }

  items.images = req.body.images;
  items.name = req.body.name;
  items.description = req.body.description;
  items.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  items.brand = transform(req.body.brand);
  const response = await items.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: response });
});

router.get("/", async (req, res) => {
  const sort = req.query.sort;
  const brand = req.query.brand;
  const gender = req.query.gender;
  const color = req.query.color;
  const releaseYear = req.query.releaseYear;
  const tag = req.query.tag;
  const limit = Number(req.query.limit) || undefined;
  const offset = Number(req.query.offset) || undefined;
  const popular = { favoriteBy: { _count: "desc" } };
  const newest = { releaseYear: "desc" };
  const latest = { createdAt: "desc" };

  const order =
    sort === "newest" ? newest : sort === "latest" ? latest : popular;

  const filter = {
    AND: [
      brand && {
        brand: {
          name: {
            contains: brand,
            lte: "insensitive",
          },
        },
      },
      gender && {
        gender: gender.toUpperCase(),
      },
      color && {
        color: {
          contains: color,
          lte: "insensitive",
        },
      },
      releaseYear && {
        releaseYear: Number(releaseYear),
      },
      tag && {
        tags: {
          some: {
            name: {
              contains: tag,
              lte: "insensitive",
            },
          },
        },
      },
    ].filter(Boolean),
  };

  const data = await items.findMany(filter, limit, offset, order);

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], items: [] });

  const count = await items.count();
  res
    .status(status.OK)
    .json({ message: status[status.OK], items: data, count });
});

router.get("/tags", async (req, res) => {
  const tags = await items.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/:item([a-zA-Z0-9_-]+)", async (req, res) => {
  items.id = req.params.item;
  const data = await items.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], item: data });
});

router.patch("/:item", async (req, res) => {
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
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );
  }
  items.id = req.params.item;
  let itemExists = await items.find();

  if (!itemExists) {
    logger.error("Item not found");
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });
  }

  const response = await items.save(itemData);
  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: response });
});

router.delete("/:item", async (req, res) => {
  // const item = new Item();
  items.id = req.params.item;
  let itemExists = await items.find();

  if (!itemExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await items.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
