const prisma = require("../functions/prisma");
const Collection = require("./Collection");
const { faker } = require("@faker-js/faker");
const User = require("./User");

describe("Collection", () => {
  let user;
  let collection;
  let collectionData;
  let mockUserReturnValue;

  beforeAll(() => {
    user = new User();
    collection = new Collection();

    collectionData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.commerce.productDescription(),
      tags: ["tag1", "tag2"],
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.collection.deleteMany(),
    ]);
    user = {};
    collection = {};
  });

  describe("create", () => {
    it("Should call save method when creating a collection", async () => {
      collection.name = collectionData.name;
      collection.description = collectionData.description;

      mockcreate = jest.spyOn(collection, "create").mockResolvedValue();
      await collection.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created collection object", async () => {
      user.email = faker.internet.email();
      user.password = faker.internet.password();
      await user.save();
      collection.tags = ["tag1", "tag2"];
      collection.authorId = user.id;
      const result = await collection.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("find", () => {
    it("Should return null if collection not found", async () => {
      await collection.delete();
      const result = await collection.find();

      expect(result).toBeNull();
    });

    it("Should return collection object if found", async () => {
      await collection.save();
      const result = await collection.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", collectionData.name);
      expect(result).toHaveProperty("description", collectionData.description);
      expect(result.tags).toBeInstanceOf(Array);
    });
  });

  describe("findById", () => {
    it("Should return null if collection not found", async () => {
      collection.id = "invalid_collection_id";
      const result = await collection.findById();

      expect(result).toBeNull();
    });

    it("Should return collection object if found", async () => {
      const saved = await collection.save();
      collection.id = saved.id;
      const result = await collection.findById();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("name", saved.name);
      expect(result).toHaveProperty("description", saved.description);
    });
  });

  describe("update", () => {
    it("Should return null if collection.id invalid", async () => {
      await collection.delete();
      collection.id = "invalid_collection_id";
      const update = await collection.update();

      expect(update).toBeNull();
    });

    it("should return the updated user object", async () => {
      collection.name = collectionData.name;
      collection.description = collectionData.description;
      const saved = await collection.save();
      const newname = faker.internet.username();
      collection.id = saved.id;
      collection.tags = ["tag1", "tag2"];
      collection.name = newname;

      const result = await collection.update();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("name", newname);
      expect(result).toHaveProperty("description", collectionData.description);
    });
  });

  describe("delete", () => {
    it("Should return true if collection deleted", async () => {
      const result = await collection.delete();

      expect(result).toBeTruthy();
    });

    it("Should return false if invalid collection provided", async () => {
      collection.id = "invalid_collection_id";
      const result = await collection.delete();

      expect(result).toBeNull();
    });
  });
});
