const prisma = require("../functions/prisma");
const Comment = require("./Comment");
const Brand = require("./Brand");
const User = require("./User");
const { faker } = require("@faker-js/faker");

describe("Comment", () => {
  let brand;
  let comment;
  let commentData;

  beforeAll(async () => {
    let user = new User();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    await user.save();
    brand = new Brand();
    brand.name = faker.internet.username();
    brand.description = faker.lorem.sentence();
    await brand.save();
    comment = new Comment();

    commentData = {
      id: faker.string.uuid(),
      content: faker.lorem.sentence(),
      entity: "BRAND",
      entityId: brand.id,
      tags: ["tag1", "tag2"],
      userId: user.id,
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.$transaction([
      prisma.comment.deleteMany(),
      prisma.brand.deleteMany(),
    ]);
  });

  describe("create", () => {
    it("Should call create method when creating a comment", async () => {
      mockcreate = jest.spyOn(comment, "create").mockResolvedValue();
      await comment.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created comment object", async () => {
      comment.content = commentData.content;
      comment.description = commentData.description;
      comment.entity = commentData.entity;
      comment.entityId = commentData.entityId;
      comment.tags = commentData.tags;
      comment.userId = commentData.userId;
      const result = await comment.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("content", commentData.content);
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating a comment", async () => {
      mockcreate = jest.spyOn(comment, "save").mockResolvedValue();
      await comment.save();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should call update method if comment exist", async () => {
      const newcomment = faker.lorem.sentence();
      comment.content = newcomment;

      const result = await comment.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("content", newcomment);
    });

    it("Should call create method if comment exist", async () => {
      await prisma.comment.deleteMany();
      comment.id = undefined;
      comment.content = commentData.content;
      const result = await comment.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("content", commentData.content);
    });
  });

  describe("update", () => {
    it("Should call update method when updating a comment", async () => {
      mockcreate = jest.spyOn(comment, "update").mockResolvedValue();
      await comment.save();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the updated comment object", async () => {
      let newcomment = faker.lorem.sentence();
      comment.content = newcomment;
      const result = await comment.update();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("content", newcomment);
    });
  });

  describe("findMany", () => {
    it("Should return an empty array if no comment is found", async () => {
      await prisma.comment.deleteMany();
      const result = await comment.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });
    it("Should return an array of comments if found", async () => {
      await comment.save();
      result = await comment.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });
  });

  describe("delete", () => {
    it("Should return true if comment deleted", async () => {
      const result = await comment.delete();

      expect(result).toBeTruthy();
    });

    it("Should return false if invalid comment provided", async () => {
      comment.id = "invalid_comment_id";
      const result = await comment.delete();

      expect(result).toBeNull();
    });
  });
});
