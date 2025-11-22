const express = require("express");
const { collections } = require("../utils/collection");
const { styles } = require("../utils/style");
const auth = require("../middleware/auth");
const { status } = require("http-status");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let data = {};

  if (!!req.body.tags && req.body.tags.length > 0)
    data.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  data = {
    name: req.body.name,
    description: req.body.description,
    authorId: req.user.id,
  };

  const response = await collections.save(data);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], collection: response });
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
        styles: {
          items: {
            brand: { name: { contains: brand, lte: "insensitive" } },
          },
        },
      },
      gender && {
        gender: gender.toUpperCase(),
      },
      color && {
        styles: {
          items: {
            color,
            _count: "desc",
          },
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

  const many = await collections.findMany(filter, limit, offset, order);

  if (!many.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], collections: many });

  const count = await collections.count(filter);
  res
    .status(status.OK)
    .json({ message: status[status.OK], collections, count });
});

router.get("/count", async (req, res) => {
  const count = await collections.count();
  res.status(status.OK).json({ message: status[status.OK], count });
});

router.get("/tags", async (req, res) => {
  const tags = await collections.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/:collection", async (req, res) => {
  collections.id = req.params.collection;
  const isCollection = await collections.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res
    .status(status.OK)
    .json({ message: status[status.OK], collections: isCollection });
});

router.get("/:collection/styles", async (req, res) => {
  styles.collection = req.params.collection;
  const many = await styles.findMany();

  if (!many.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], styles: many });
});

router.patch("/:collection", auth, async (req, res) => {
  collections.id = req.params.collection;
  const isCollection = await collections.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  let data = { ...req.body };
  if (req.body.tags && req.body.tags.length > 0)
    data.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const response = collections.save(data);

  res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:collection", auth, async (req, res) => {
  const isCollection = await collections.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await collections.delete();

  res.status(status.NO_CONTENT).end();
});

module.exports = router;
