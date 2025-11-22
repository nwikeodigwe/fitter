const express = require("express");
const { items } = require("../utils/Item");
const { styles } = require("../utils/Style");
const { collections } = require("../utils/Collection");
const { brands } = require("../utils/Brand");
const { search } = require("../utils/Search");
const { status } = require("http-status");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();
  const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 20;

  const result = { items: [], styles: [], collections: [], brands: [] };
  const where = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ],
  };

  let manyItems = await items.findMany(where, limit);
  let manyStyles = await styles.findMany(where, limit);
  let manyCollections = await collections.findMany(where, limit);
  let manyBrands = await brands.findMany(where, limit);

  result.items = manyItems;
  result.styles = manyStyles;
  result.collections = manyCollections;
  result.brands = manyBrands;

  res.json({ message: status[status.OK], result });
});

router.get("/latest", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const searches = await search.findMany({}, limit, offset);

  if (!searches.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.json({ message: status[status.OK], searches });
});

router.get("/featured", async (req, res) => {
  const searches = await search.findMany();

  if (!searches.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.json({ message: status[status.OK], searches });
});

router.post("/add", async (req, res) => {
  console.info(req.body);
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();

  const response = await search.add(query);

  res.json({ message: status[status.OK], response });
});

router.post("/item", async (req, res) => {
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();
  const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 20;

  const result = { items: [], styles: [], collections: [], brands: [] };
  const where = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ],
  };

  let many = await items.findMany(where, limit);

  res.json({ message: status[status.OK], items: many });
});

router.post("/style", async (req, res) => {
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();
  const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 20;

  const where = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ],
  };

  let many = await styles.findMany(where, limit);

  res.json({ message: status[status.OK], styles: many });
});

router.post("/collection", async (req, res) => {
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();
  const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 20;

  const result = { items: [], styles: [], collections: [], brands: [] };
  const where = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ],
  };

  let many = await collections.findMany(where, limit);

  res.json({ message: status[status.OK], collections: many });
});

router.post("/brand", async (req, res) => {
  if (!req.body.q || req.body.q.trim().length === 0)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.body.q.trim().toLowerCase();
  const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 20;

  const result = { items: [], styles: [], collections: [], brands: [] };
  const where = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ],
  };

  let brands = await brands.findMany(where, limit);

  res.json({ message: status[status.OK], brands });
});

module.exports = router;
