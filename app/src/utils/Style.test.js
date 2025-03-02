const Style = require("./Style");
const Collection = require("./Collection");
const User = require("./User");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");

describe("Style", () => {
  let style;
  let collection;
  let user;

  beforeAll(async () => {
    style = new Style();
    collection = new Collection();
    user = new User();

    styleData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      tags: ["tag1", "tag2"],
    };

    user.email = faker.internet.email();
    user.password = faker.internet.password();
    await user.save();

    collection.name = faker.internet.username();
    collection.description = faker.lorem.sentence();
    collection.tags = ["tag1", "tag2"];
    collection.authorId = user.id;
    await collection.create();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.style.deleteMany();
  });

  describe("create", () => {
    it("Should call create method when creating a style", async () => {
      mockcreate = jest.spyOn(style, "create").mockResolvedValue();
      await style.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created style object", async () => {
      style.name = styleData.name;
      style.description = styleData.description;
      style.collection = collection.id;
      style.author = user.id;
      style.tags = styleData.tags;
      const result = await style.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", styleData.name);
      expect(result).toHaveProperty("description", styleData.description);
      expect(result).toHaveProperty("collection");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("update", () => {
    it("Should call update method when updating a style", async () => {
      mockupdate = jest.spyOn(style, "update").mockResolvedValue();
      await style.update();

      expect(mockupdate).toHaveBeenCalled();
      mockupdate.mockRestore();
    });

    it("Should return the updated style object", async () => {
      const newName = faker.commerce.productName();
      style.name = newName;
      const result = await style.update();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", newName);
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating a style", async () => {
      mocksave = jest.spyOn(style, "save").mockResolvedValue();
      await style.save();

      expect(mocksave).toHaveBeenCalled();
      mocksave.mockRestore();
    });

    it("Should call update method if style exist", async () => {
      const newName = faker.commerce.productName();
      style.name = newName;
      const result = await style.save();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", newName);
    });

    it("Should call create method if style exist", async () => {
      await prisma.style.deleteMany();
      style.id = undefined;
      style.name = styleData.name;
      const result = await style.save();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", styleData.name);
    });
  });

  describe("find", () => {
    it("Should call find method when finding a style", async () => {
      mockfind = jest.spyOn(style, "find").mockResolvedValue();
      await style.find();

      expect(mockfind).toHaveBeenCalled();
      mockfind.mockRestore();
    });

    it("Should return null if no style found", async () => {
      await style.delete();
      const result = await style.find();
      expect(result).toBeNull();
    });

    it("Should return the found style object", async () => {
      style.id = undefined;
      await style.create();
      const result = await style.find();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("collection");
      expect(result).toHaveProperty("author");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting a style", async () => {
      mockdelete = jest.spyOn(style, "delete").mockResolvedValue();
      await style.delete();

      expect(mockdelete).toHaveBeenCalled();
      mockdelete.mockRestore();
    });

    it("Should return null if style not found", async () => {
      await style.delete();
      const result = await style.find();

      expect(result).toBeNull();
    });

    it("Should return the deleted style object", async () => {
      await style.create();
      const result = await style.delete();

      expect(result).toHaveProperty("id");
    });
  });
});
