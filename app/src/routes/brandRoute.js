const express = require("express");
const Brand = require("../utils/Brand");
const User = require("../utils/User");
const Comment = require("../utils/Comment");
const { status } = require("http-status");
const transform = require("../functions/transform");
const router = express.Router();

const ENTITY = "BRAND";

router.post("/", async (req, res) => {
  let brand = new Brand();

  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  brand.name = transform(req.body.name);

  brand.owner = req.body.owner ? req.body.owner : req.user.id;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && req.body.tags.length > 0)
    brand.tags = req.body.tags.map((tag) => transform(tag));

  brand.logo = req.body.logo ? req.body.logo : undefined;

  let brandExists = await brand.find();

  if (brandExists)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user = await user.find({
    id: brand.owner,
  });

  if (!user) brand.owner = req.user.id;

  brand.description = req.body.description;
  brand = await brand.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: brand });
});

router.get("/", async (req, res) => {
  let brands = new Brand();
  brands = await brands.findMany();

  if (!brands.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brands });
});

router.get("/:brand", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brand = await brand.find();

  if (!brand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brand });
});

router.patch("/:brand", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  brand.owner = req.user.id;

  brand.name = req.body.name ? transform(req.body.name) : undefined;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && req.body.tags.length > 0)
    brand.tags = req.body.tags.map((tag) => transform(tag));

  brand = await brand.save();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brand });
});

router.post("/:brand/favorite", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await brand.favorite(req.user.id);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: favorite });
});

router.delete("/:brand/unfavorite", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let favorite = await brand.isFavorited(req.user.id);

  if (!favorite)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await brand.unfavorite(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.put("/:brand/upvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let upvote = await brand.upvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: upvote });
});

router.put("/:brand/downvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let downvote = await brand.downvote(req.user.id);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: downvote });
});

router.delete("/:brand/unvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let vote = await brand.isVoted(req.user.id);

  if (!vote)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await brand.unvote(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

router.post("/:brand/subscribe", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let subscribe = await brand.isSubscribed(req.user.id);

  if (subscribe)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  subscribe = await brand.subscribe(req.user.id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: subscribe });
});

router.delete("/:brand/unsubscribe", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const subscription = await brand.isSubscribed(req.user.id);

  if (!subscription)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  await brand.unsubscribe(subscription.id);

  return res.status(status.NO_CONTENT).end();
});

router.post("/:brand/comment", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let commentData = {
    content: req.body.content,
    userId: req.user.id,
    entity: ENTITY,
    entityId: brand.id,
  };

  commentData.tags = req.body.tags.map((tag) => transform(tag));

  let comment = new Comment();
  comment = await comment.save(commentData);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: comment });
});

router.post("/:brand/comment/:comment", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brand = await brand.find();

  if (!brand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: "brand not found" });

  if (!req.body.content || req.body.content == null)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let commentData = {};
  commentData.tags = req.body.tags.map((tag) => transform(tag));

  let comment = new Comment();
  comment.id = req.params.comment;
  let commentExists = await comment.find();

  if (!commentExists)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      data: "comment does not exixt",
    });

  commentData = {
    content: req.body.content,
    userId: req.user.id,
    entity: ENTITY,
    entityId: brand.id,
  };

  comment = await comment.save(commentData);

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: comment });
});

router.get("/:brand/comments", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let comments = new Comment();
  comments = await comments.findMany({ entityId: req.params.brand });

  res.status(status.OK).json({ message: status[status.OK], data: comments });
});

router.delete("/comment/:comment", async (req, res) => {
  let comment = new Comment();
  comment.id = req.params.comment;
  let commentExists = await comment.find();

  if (!commentExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await comment.delete();

  return res.status(status.NO_CONTENT).end();
});

router.delete("/:brand", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  if (brandExists.owner.id === req.user.id) brand.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
