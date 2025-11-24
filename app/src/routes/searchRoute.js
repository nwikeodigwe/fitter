const express = require("express");
const { items } = require("../utils/item");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { brands } = require("../utils/brand");
const { search } = require("../utils/search");
const { status } = require("http-status");
const router = express.Router();

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit);
  if (!req.query.search)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const query = req.query.search.trim().toLowerCase();
  const order = { favoritedBy: { _count: "desc" } };

  const filter = {
    OR: [
      { name: { contains: query } },
      { description: { contains: query } },
      {
        tags: {
          some: {
            name: {
              contains: query,
              lte: "insensitive",
            },
          },
        },
      },
    ].filter(Boolean),
  };

  const result = { items: [], styles: [], collections: [], brands: [] };

  let brand = await items.findMany({filter, limit, order});
  let style = await styles.findMany({filter, limit, order});
  let collection = await collections.findMany({filter, limit, order});
  let item = await brands.findMany({filter, limit, order});

  result.items = item;
  result.styles = style;
  result.collections = collection;
  result.brands = brand;

  res.json({ message: status[status.OK], result });
});

module.exports = router;
