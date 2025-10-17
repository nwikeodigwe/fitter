const express = require("express");
const { item } = require("../utils/Item");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { brand } = require("../utils/Brand");
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

  let items = await item.findMany(where, limit);
  let styles = await style.findMany(where, limit);
  let collections = await collection.findMany(where, limit);
  let brands = await brand.findMany(where, limit);

  result.items = items;
  result.styles = styles;
  result.collections = collections;
  result.brands = brands;

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

  let items = await item.findMany(where, limit);

  res.json({ message: status[status.OK], items });
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

  let styles = await style.findMany(where, limit);

  res.json({ message: status[status.OK], styles });
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

  let collections = await collection.findMany(where, limit);

  res.json({ message: status[status.OK], collections });
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

  let brands = await brand.findMany(where, limit);

  res.json({ message: status[status.OK], brands });
});

module.exports = router;
