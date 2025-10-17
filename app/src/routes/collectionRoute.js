const express = require("express");
const { collection } = require("../utils/Collection");
const { style } = require("../utils/Style");
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

  const response = await collection.save(data);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: response });
});

router.get("/", async (req, res) => {
  const collections = await collection.findMany();

  if (!collections.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], data: collections });
});

router.get("/tags", async (req, res) => {
  const tags = await collection.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/:collection", async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], collection });
});

router.get("/:collection/styles", async (req, res) => {
  style.collection = req.params.collection;
  const styles = await style.findMany();

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  res.status(status.OK).json({ message: status[status.OK], styles });
});

router.post("/:collection/favorite", auth, async (req, res) => {
  collection.id = req.params.collection;
  let isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  let favorite = await collection.favorite(req.user.id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], favorite });
});

router.delete("/:collection/unfavorite", auth, async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isFavorited = await collection.isFavorited(req.user.id);

  if (!isFavorited)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await collection.unfavorite(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.put("/:collection/upvote", auth, async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const upvote = await collection.upvote(req.user.id);

  res.status(status.OK).json({ message: status[status.BAD_REQUEST], upvote });
});

router.put("/:collection/downvote", async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const downvote = await collection.downvote(req.user.id);

  res.status(status.OK).json({ message: status[status.OK], downvote });
});

router.delete("/:collection/unvote", auth, async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isVoted = await collection.isVoted(req.user.id);

  if (!isVoted)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await collection.unvote(req.user.id);

  res.status(status.NO_CONTENT).end();
});

router.patch("/:collection", auth, async (req, res) => {
  collection.id = req.params.collection;
  const isCollection = await collection.find();

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

  const response = collection.save(data);

  res.status(status.OK).json({ message: status[status.OK], response });
});

router.delete("/:collection", auth, async (req, res) => {
  const isCollection = await collection.find();

  if (!isCollection)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await collection.delete();

  res.status(status.NO_CONTENT).end();
});

module.exports = router;
