const { users } = require("./user");
const { collections } = require("./collection");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");

describe("Collection", () => {
  let userData;
  let mockUserReturnValue;
  let collectionData;
  let mockCollectionReturnValue;

  beforeAll(() => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      tags: ["tag1", "tag2"],
    };

    collectionData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.commerce.productDescription(),
      author: { id: userData.id },
      tags: ["tag1", "tag2"],
    };

    mockCollectionReturnValue = {
      id: jest.fn(() => collectionData.id),
      name: jest.fn(() => collectionData.name),
      description: jest.fn(() => collectionData.description),
      tags: jest.fn(() => collectionData.tags),
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      password: jest.fn(() => userData.password),
      email: jest.fn(() => userData.email),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call save method when creating a collection", async () => {
      jest.spyOn(prisma.collection, "create").mockResolvedValue(true);

      collections.name = faker.commerce.product();
      collections.description = faker.commerce.productDescription();

      await collections.create();

      expect(prisma.collection.create).toHaveBeenCalled();
    });

    it("Should return the created collection object", async () => {
      jest
        .spyOn(prisma.collection, "create")
        .mockResolvedValue(mockCollectionReturnValue);

      users.email = faker.internet.email();
      users.password = faker.internet.password();
      await users.save();
      collections.tags = collectionData.tags;
      collections.authorId = "author_id";
      collections.id = "collection_id";
      const result = await collections.create();

      expect(prisma.collection.create).toHaveBeenCalled();
      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("find", () => {
    it("Should return null if collection not found", async () => {
      jest.spyOn(prisma.collection, "findFirst").mockResolvedValue(null);

      collections.id = "collection_id";
      const result = await collections.find();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should throw error if id, name  not provided", async () => {
      collections.id = undefined;
      collections.name = undefined;
      collections.slug = undefined;

      await expect(collections.find()).rejects.toThrow(
        /At least one of id or slug must be provided/
      );
    });

    it("Should return collection object if found", async () => {
      jest
        .spyOn(prisma.collection, "findFirst")
        .mockResolvedValue(mockCollectionReturnValue);

      collections.name = collectionData.name;
      collections.description = collectionData.description;
      collections.tags = collectionData.tags;
      collections.id = "collection_id";
      const result = await collections.find();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("findById", () => {
    it("Should return null if collection not found", async () => {
      jest.spyOn(prisma.collection, "findUnique").mockResolvedValue(null);

      collections.id = "invalid_collection_id";
      const result = await collections.findById();

      expect(prisma.collection.findUnique).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should return collection object if found", async () => {
      jest
        .spyOn(prisma.collection, "findUnique")
        .mockResolvedValue(mockCollectionReturnValue);

      collections.authorId = userData.id;
      collections.id = "collection_id";
      const result = await collections.findById();

      expect(prisma.collection.findUnique).toHaveBeenCalled();
      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("update", () => {
    it("Should return null if collection.id invalid", async () => {
      jest.spyOn(prisma.collection, "findFirst").mockResolvedValue(null);

      collections.id = "invalid_collection_id";
      const result = await collections.update();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });

    it("should return the updated user object", async () => {
      jest.spyOn(prisma.collection, "findFirst").mockResolvedValue(true);

      const newname = faker.internet.username();

      jest
        .spyOn(prisma.collection, "update")
        .mockResolvedValue({ ...mockCollectionReturnValue, name: newname });

      collections.name = newname;
      collections.id = "collection_id";
      collections.id = "collection_id";

      const result = await collections.update();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(prisma.collection.update).toHaveBeenCalled();
      expect(result).toMatchObject({
        ...mockCollectionReturnValue,
        name: newname,
      });
    });
  });

  describe("delete", () => {
    it("Should return true if collection deleted", async () => {
      jest.spyOn(prisma.collection, "findFirst").mockResolvedValue(true);
      jest
        .spyOn(prisma.collection, "delete")
        .mockResolvedValue(mockCollectionReturnValue);

      const result = await collections.delete();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(prisma.collection.delete).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it("Should return false if invalid collection provided", async () => {
      jest.spyOn(prisma.collection, "findFirst").mockResolvedValue(false);

      collections.id = "invalid_collection_id";
      const result = await collections.delete();

      expect(prisma.collection.findFirst).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });
  });
});
