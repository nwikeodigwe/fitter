const { user } = require("../utils/User");
const { image } = require("../utils/Image");
const { brand } = require("../utils/Brand");
const { collection } = require("../utils/Collection");
const { style } = require("../utils/Style");
const { item } = require("../utils/Item");
const { comment } = require("../utils/Comment");
const { faker } = require("@faker-js/faker");
const prisma = require("./prisma");

const createTestUser = async () => {
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  await user.save();
  const login = await user.login();
  return { account: user, login };
};

const createTestImage = async () => {
  image.url = faker.image.url();
  // jest.spyOn(image, "save").mockResolvedValue(mockSavedImage);
  await image.save();
  return image;
};

const createTestCollection = async (userId) => {
  collection.name = faker.commerce.product();
  collection.description = faker.commerce.productDescription();
  collection.authorId = userId;
  collection.tags = ["tag1", "tag2"];
  await collection.save();
  return collection;
};

const createTestStyle = async (user, collection) => {
  style.name = faker.commerce.productName();
  style.description = faker.commerce.productDescription();
  style.author = user;
  style.tags = ["tag1", "tag2"];
  style.collection = collection;
  await style.save();
  return style;
};

const createTestBrand = async (ownerId, logoId) => {
  brand.name = faker.commerce.product();
  brand.description = faker.commerce.productName();
  brand.tags = ["tag1", "tag2"];
  brand.logo = logoId;
  brand.owner = ownerId;
  await brand.save();
  return brand;
};

const createTestItem = async (brandName, userId, imageId) => {
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
