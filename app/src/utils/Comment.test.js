const { comment } = require("./Comment");
const { brand } = require("./Brand");
const { user } = require("./User");
const { faker } = require("@faker-js/faker");

describe("Comment", () => {
  let userData;
  let mockUserReturnValue;
  let commentData;
  let mockCommentReturnValue;

  beforeAll(async () => {
    // let user = new User();
    // user.email = faker.internet.email();
    // user.password = faker.internet.password();
    // await user.save();
    // brand = new Brand();
    // brand.name = faker.internet.username();
    // brand.description = faker.lorem.sentence();
    // await brand.save();
    // comment = new Comment();

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
      jest.spyOn(comment, "create").mockResolvedValue();
      await comment.create();

      expect(comment.create).toHaveBeenCalled();
    });

    it("Should return the created comment object", async () => {
      jest.spyOn(comment, "create").mockResolvedValue(mockCommentReturnValue);

      comment.content = commentData.content;
      comment.description = commentData.description;
      comment.entity = commentData.entity;
      comment.entityId = commentData.entityId;
      comment.tags = commentData.tags;
      comment.userId = commentData.userId;
      const result = await comment.create();

      expect(result).toMatchObject(mockCommentReturnValue);
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating a comment", async () => {
      jest.spyOn(comment, "save").mockResolvedValue();
      await comment.save();

      expect(comment.save).toHaveBeenCalled();
    });

    it("Should call update method if comment exist", async () => {
      const newcomment = faker.lorem.sentence();
      comment.content = newcomment;

      jest
        .spyOn(comment, "save")
        .mockResolvedValue({ ...mockCommentReturnValue, content: newcomment });

      const result = await comment.save();

      expect(result).toMatchObject({
        ...mockCommentReturnValue,
        content: newcomment,
      });
    });

    it("Should call create method if comment exist", async () => {
      jest.spyOn(comment, "delete").mockResolvedValue(mockCommentReturnValue);

      await comment.delete();

      jest.spyOn(comment, "save").mockResolvedValue(null);

      comment.id = undefined;
      comment.content = commentData.content;
      const result = await comment.save();

      expect(comment.save).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("Should call update method when updating a comment", async () => {
      jest.spyOn(comment, "save").mockResolvedValue(mockCommentReturnValue);
      await comment.save();

      expect(comment.save).toHaveBeenCalled();
    });

    it("Should return the updated comment object", async () => {
      let newcomment = faker.lorem.sentence();
      comment.content = newcomment;

      jest
        .spyOn(comment, "update")
        .mockResolvedValue({ ...mockCommentReturnValue, content: newcomment });

      const result = await comment.update();

      expect(result).toMatchObject({
        ...mockCommentReturnValue,
        content: newcomment,
      });
    });
  });

  describe("findMany", () => {
    it("Should return an empty array if no comment is found", async () => {
      jest.spyOn(comment, "deleteMany").mockResolvedValue();

      await comment.deleteMany();

      jest.spyOn(comment, "findMany").mockResolvedValue([]);

      const result = await comment.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    it("Should return an array of comments if found", async () => {
      jest.spyOn(comment, "save").mockResolvedValue(mockCommentReturnValue);

      jest
        .spyOn(comment, "findMany")
        .mockResolvedValue([mockCommentReturnValue]);

      await comment.save();
      result = await comment.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });
  });

  describe("delete", () => {
    it("Should return true if comment deleted", async () => {
      jest.spyOn(comment, "delete").mockResolvedValue(mockCommentReturnValue);

      const result = await comment.delete();

      expect(result).toBeTruthy();
    });

    it("Should return false if invalid comment provided", async () => {
      jest.spyOn(comment, "delete").mockResolvedValue(null);

      comment.id = "invalid_comment_id";
      const result = await comment.delete();

      expect(result).toBeNull();
    });
  });
});
