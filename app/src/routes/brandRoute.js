const express = require("express");
const { brands } = require("../utils/brand");
const { users } = require("../utils/user");
const { status } = require("http-status");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  // const brand = new Brand();
  brands.name = req.body.name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, " ");

  brands.owner = req.body.owner ? req.body.owner : req.user.id;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && req.body.tags.length > 0)
    brands.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    );

  brands.logo = req.body.logo ? req.body.logo : undefined;

  const isBrand = await brands.find();

  if (isBrand)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const isUser = await users.find({
    id: brands.owner,
  });

  if (!isUser) brands.owner = req.user.id;

  brands.description = req.body.description;

  const response = await brands.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.get("/", async (req, res) => {
  const sort = req.query.sort;
  const gender = req.query.gender;
  const releaseYear = req.query.releaseYear;
  const tag = req.query.tag;
  const limit = Number(req.query.limit) || undefined;
  const offset = Number(req.query.offset) || undefined;
  const popular = { favoritedBy: { _count: "desc" } };
  const newest = { releaseYear: "desc" };
  const latest = { createdAt: "desc" };
  const select = {};

  const order =
    sort === "newest" ? newest : sort === "latest" ? latest : popular;

  const filter = {
    AND: [
      gender && {
        gender: gender.toUpperCase(),
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

  const data = await brands.findMany(filter, limit, offset, order);

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], brands: [] });

  const count = await brands.count(filter);
  return res
    .status(status.OK)
    .json({ message: status[status.OK], brands: data, count });
});

router.get("/tags", async (req, res) => {
  const tags = await brands.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], brands: [] });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/popular", async (req, res) => {
  // const brand = new Brand();
  const brands = await brands.findMany();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brands });
});

router.get("/:brand", async (req, res) => {
  brands.id = req.params.brand;
  const response = await brands.find();

  if (!response)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], brand: response });
});

router.patch("/:brand", auth, async (req, res) => {
  // const brand = new Brand();
  brands.id = req.params.brand;
  const isBrand = await brands.find();

  if (!isBrand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  brands.owner = req.user.id;

  brands.name = req.body.name
    ? req.body.name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    : null;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  brands.tags = req.body.tags
    ? req.body.tags.map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, " ")
      )
    : null;

  const response = await brands.save();

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:brand", auth, async (req, res) => {
  // const brand = new Brand();
  brands.id = req.params.brand;
  const data = await brands.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (data.owner.id === req.user.id) await brands.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
