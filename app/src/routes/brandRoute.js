const express = require("express");
const { brand } = require("../utils/Brand");
const { user } = require("../utils/User");
const { status } = require("http-status");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  // const brand = new Brand();
  brand.name = req.body.name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, " ");

  brand.owner = req.body.owner ? req.body.owner : req.user.id;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && req.body.tags.length > 0)
    brand.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    );

  brand.logo = req.body.logo ? req.body.logo : undefined;

  const isBrand = await brand.find();

  if (isBrand)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const isUser = await user.find({
    id: brand.owner,
  });

  if (!isUser) brand.owner = req.user.id;

  brand.description = req.body.description;

  const response = await brand.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.get("/count", async (req, res) => {
  const count = await brand.count();
  res.status(status.OK).json({ message: status[status.OK], count });
});

router.get("/", async (req, res) => {
  const brands = await brand.findMany();

  if (!brands.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], brands });
});

router.get("/tags", async (req, res) => {
  const tags = await brand.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/popular", async (req, res) => {
  // const brand = new Brand();
  const brands = await brand.findMany();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brands });
});

router.get("/:brand", async (req, res) => {
  brand.id = req.params.brand;
  const response = await brand.find();

  if (!response)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], brand });
});

router.patch("/:brand", auth, async (req, res) => {
  // const brand = new Brand();
  brand.id = req.params.brand;
  const isBrand = await brand.find();

  if (!isBrand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  brand.owner = req.user.id;

  brand.name = req.body.name
    ? req.body.name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    : null;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  brand.tags = req.body.tags
    ? req.body.tags.map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, " ")
      )
    : null;

  const response = await brand.save();

  return res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:brand", auth, async (req, res) => {
  // const brand = new Brand();
  brand.id = req.params.brand;
  const isBrand = await brand.find();

  if (!isBrand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (isBrand.owner.id === req.user.id) await brand.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
