const express = require("express");
const { items } = require("../utils/item");
const { users } = require("../utils/user");
const logger = require("../utils/logger");
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
  const colorway = req.query.colorway;
  const material = req.query.material;
  const releaseYear = req.query.releaseYear;
  const limit = parseInt(req.query.limit) || undefined;
  const offset = parseInt(req.query.offset) || undefined;
  const popular = { favoriteItem: { _count: "desc" } };
  const newest = { releaseYear: "desc" };
  const latest = { createdAt: "desc" };
  const category = req.query.category;
  const season = req.query.season;
  const published = req.query.published;
  const author = req.query.author;

  const flexible =
    req.query.flexible === "true" || req.query.flexible === "1" ? "OR" : "AND";
  const tags = Array.isArray(req.query.tags)
    ? req.query.tags
    : req.query.tags && [req.query.tags];
  const designers = Array.isArray(req.query.designers)
    ? req.query.designers
    : req.query.designers && [req.query.designers];

  const order =
    sort === "newest" ? newest : sort === "latest" ? latest : popular;

  const filter = {
    [flexible]: [
      brand && {
        brand: {
          name: {
            contains: brand,
            lte: "insensitive",
          },
        },
      },
      author && {
        author: {
          name: {
            contains: author,
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
      colorway && {
        colorway: {
          contains: colorway,
          lte: "insensitive",
        },
      },
      season && {
        season: season.toUpperCase(),
      },
      category && {
        category: category.toUpperCase(),
      },
      material && {
        material: {
          contains: material,
          lte: "insensitive",
        },
      },
      releaseYear && {
        releaseYear: Number(releaseYear),
      },
      tags && {
        tags: {
          some: {
            name: {
              in: tags,
              lte: "insensitive",
            },
          },
        },
      },
      designers && {
        designers: {
          some: {
            name: {
              in: designers,
              lte: "insensitive",
            },
          },
        },
      },
      published && {
        published,
      },
    ].filter(Boolean),
  };

  const data = await items.findMany({ filter, limit, offset, order });

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
  items.slug = req.params.item;
  const data = await items.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], items: data });
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
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], items: {}, error: true });
  }

  if (!!req.body.tags && req.body.tags.length > 0) {
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );
  }
  items.slug = req.params.item;
  const find = await items.find();

  if (!find) {
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], items: {}, error: true });
  }

  const response = await items.save({ ...req.body });
  return res
    .status(status.OK)
    .json({ message: status[status.OK], items: response });
});

router.delete("/:item", async (req, res) => {
  items.slug = req.params.item;
  let find = await items.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], items: {}, error: true });

  await items.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
