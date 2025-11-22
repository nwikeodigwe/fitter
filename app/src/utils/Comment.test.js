const { comments } = require("./Comment");
const prisma = require("../functions/prisma");

const { faker } = require("@faker-js/faker");

describe("Comment", () => {
  let userData;
  let commentData;
  let mockCommentReturnValue;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.description),
    };

    commentData = {
      id: faker.string.uuid(),
      content: faker.lorem.sentence(),
      entity: "BRAND",
      entityId: faker.string.uuid(),
      tags: ["tag1", "tag2"],
      user: { id: userData.id },
    };

    mockCommentReturnValue = {
      id: jest.fn(() => commentData.id),
      content: jest.fn(() => commentData.content),
      tags: jest.fn(() => commentData.tags),
      user: { id: jest.fn(() => commentData.userId) },
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call create method when creating a comment", async () => {
      jest.spyOn(comments, "create").mockResolvedValue();
      await comments.create();

      expect(comments.create).toHaveBeenCalled();
    });

    it("Should return the created comment object", async () => {
      jest
        .spyOn(prisma.comment, "create")
        .mockResolvedValue(mockCommentReturnValue);

      comments.content = commentData.content;
      comments.description = commentData.description;
      comments.entity = commentData.entity;
      comments.entityId = commentData.entityId;
      comments.tags = commentData.tags;
      comments.userId = commentData.userId;
      const result = await comments.create();

      expect(prisma.comment.create).toHaveBeenCalled();
      expect(result).toMatchObject(mockCommentReturnValue);
    });
  });

  describe("save", () => {
    it("Should call create method if comment exists", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.comment, "update").mockResolvedValue();

      comments.id = "comment_id";
      await comments.save();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.update).toHaveBeenCalled();
    });

    it("Should call create method if comment does not exist", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue();

      jest
        .spyOn(prisma.comment, "create")
        .mockResolvedValue(mockCommentReturnValue);

      comments.id = undefined;
      const result = await comments.save();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.create).toHaveBeenCalled();
      expect(result).toMatchObject(mockCommentReturnValue);
    });

    it("Should call create method if comment does not exist", async () => {
      jest
        .spyOn(prisma.comment, "create")
        .mockResolvedValue(mockCommentReturnValue);
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(null);

      comments.id = undefined;
      comments.content = commentData.content;
      const result = await comments.save();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.create).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });

  describe("update", () => {
    it("Should call update method when updating a comment", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(true);
      jest
        .spyOn(prisma.comment, "update")
        .mockResolvedValue(mockCommentReturnValue);

      comments.id = "comment_id";
      const result = await comments.save();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.update).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it("Should return the updated comment object", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(true);
      let newcomment = faker.lorem.sentence();
      comments.content = newcomment;

      jest
        .spyOn(prisma.comment, "update")
        .mockResolvedValue({ ...mockCommentReturnValue, content: newcomment });

      const result = await comments.update();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.update).toHaveBeenCalled();
      expect(result).toMatchObject({
        ...mockCommentReturnValue,
        content: newcomment,
      });
    });
  });

  describe("findMany", () => {
    it("Should return an empty array if no comment is found", async () => {
      jest.spyOn(prisma.comment, "findMany").mockResolvedValue([]);

      const result = await comments.findMany();

      expect(prisma.comment.findMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    it("Should return an array of comments if found", async () => {
      jest
        .spyOn(prisma.comment, "findMany")
        .mockResolvedValue([mockCommentReturnValue]);

      result = await comments.findMany();

      expect(prisma.comment.findMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });
  });

  describe("delete", () => {
    it("Should return true if comment deleted", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.comment, "delete").mockResolvedValue(true);

      const result = await comments.delete();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(prisma.comment.delete).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it("Should return false if invalid comment provided", async () => {
      jest.spyOn(prisma.comment, "findFirst").mockResolvedValue(null);

      comments.id = "invalid_comment_id";
      const result = await comments.delete();

      expect(prisma.comment.findFirst).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });
  });
});
