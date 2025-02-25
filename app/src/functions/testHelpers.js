const User = require("../utils/User");
const Image = require("../utils/Image");
const Brand = require("../utils/Brand");
const Collection = require("../utils/Collection");
const Style = require("../utils/Style");
const Item = require("../utils/Item");
const Comment = require("../utils/Comment");
const { faker } = require("@faker-js/faker");
const prisma = require("./prisma");

const createTestUser = async () => {
  let user = new User();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  await user.save();
  const login = await user.login();
  return { account: user, login };
};

const createTestImage = async () => {
  let image = new Image();
  image.url = faker.image.url();
  // jest.spyOn(image, "save").mockResolvedValue(mockSavedImage);
  await image.save();
  return image;
};

const createTestCollection = async (userId) => {
  let collection = new Collection();
  collection.name = faker.commerce.product();
  collection.description = faker.commerce.productDescription();
  collection.authorId = userId;
  collection.tags = ["tag1", "tag2"];
  await collection.save();
  return collection;
};

const createTestStyle = async (user, collection) => {
  let style = new Style();
  style.name = faker.commerce.productName();
  style.description = faker.commerce.productDescription();
  style.author = user;
  style.tags = ["tag1", "tag2"];
  style.collection = collection;
  await style.save();
  return style;
};

const createTestBrand = async (ownerId, logoId) => {
  let brand = new Brand();
  brand.name = faker.commerce.product();
  brand.description = faker.commerce.productName();
  brand.tags = ["tag1", "tag2"];
  brand.logo = logoId;
  brand.owner = ownerId;
  await brand.save();
  return brand;
};

const createTestItem = async (brandName, userId, imageId) => {
  let item = new Item();
  item.name = faker.commerce.product();
  item.description = faker.commerce.productName();
  item.tags = ["tag1", "tag2"];
  item.images = [imageId, imageId];
  item.brand = brandName;
  item.userId = userId;
  await item.save();
  return item;
};

const createTestComment = async (entity, entityId, userId) => {
  let comment = new Comment();
  comment.entity = entity;
  comment.entityId = entityId;
  comment.tags = ["tag1", "tag2"];
  comment.content = faker.commerce.productDescription();
  comment.userId = userId;
  await comment.create();
  return comment;
};

const createTestLogo = async (imageId) => {
  let logo = prisma.logo.create({
    data: {
      image: { connect: { id: imageId } },
    },
    select: {
      id: true,
    },
  });
  return logo;
};

const createTestResetToken = async (email) => {
  let user = new User();
  user.email = email;
  return user.createResetToken();
};

const response = (status, message) => {
  return {
    status: status,
    body: { message },
  };
};

module.exports = {
  createTestUser,
  createTestImage,
  createTestCollection,
  createTestStyle,
  createTestBrand,
  createTestItem,
  createTestComment,
  createTestLogo,
  createTestResetToken,
  response,
};
