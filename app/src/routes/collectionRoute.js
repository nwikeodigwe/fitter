const express = require("express");
const Collection = require("../utils/Collection");
const Style = require("../utils/Style");
const { status } = require("http-status");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let collectionData = {};

  if (!!req.body.tags && req.body.tags.length > 0)
    collectionData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  collectionData = {
    name: req.body.name,
    description: req.body.description,
    authorId: req.user.id,
  };

  let collection = new Collection();
  collection = await collection.save(collectionData);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: collection });
});

router.get("/", async (req, res) => {
  let collections = new Collection();
  collections = await collections.findMany();

  if (!collections.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], data: collections });
});

router.get("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  collection = await collection.find();

  if (!collection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], data: collection });
});

router.get("/:collection/styles", async (req, res) => {
  let styles = new Style();
  styles.collectionId = req.params.collection;
  styles = await styles.findMany();

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], data: styles });
});

router.post("/:collection/favorite", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await collection.favorite(req.user.id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: favorite });
});

router.delete("/:collection/unfavorite", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await collection.isFavorited(req.user.id);

  if (!favorite)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await collection.unfavorite(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.put("/:collection/upvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const upvote = await collection.upvote(req.user.id);

  res
    .status(status.OK)
    .json({ message: status[status.BAD_REQUEST], data: upvote });
});

router.put("/:collection/downvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const downvote = await collection.downvote(req.user.id);

  res.status(status.OK).json({ message: status[status.OK], data: downvote });
});

router.delete("/:collection/unvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const vote = await collection.isVoted(req.user.id);

  if (!vote)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await collection.unvote(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.patch("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let collectionData = { ...req.body };
  if (req.body.tags && req.body.tags.length > 0)
    collectionData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  collection = collection.save(collectionData);

  res.status(status.OK).json({ message: status[status.OK], data: collection });
});

router.delete("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await collection.delete();

  res.status(status.NO_CONTENT).end();
});

module.exports = router;
