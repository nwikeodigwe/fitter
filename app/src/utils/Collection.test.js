const { user } = require("./User");
const { collection } = require("./Collection");
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
      jest
        .spyOn(collection, "create")
        .mockResolvedValue(mockCollectionReturnValue);

      collection.name = collectionData.name;
      collection.description = collectionData.description;

      await collection.create();

      expect(collection.create).toHaveBeenCalled();
    });

    it("Should return the created collection object", async () => {
      jest
        .spyOn(collection, "create")
        .mockResolvedValue(mockCollectionReturnValue);

      jest.spyOn(user, "save").mockResolvedValue(mockUserReturnValue);

      user.email = faker.internet.email();
      user.password = faker.internet.password();
      await user.save();
      collection.tags = collectionData.tags;
      collection.authorId = user.id;
      const result = await collection.create();

      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("find", () => {
    it("Should return null if collection not found", async () => {
      await collection.delete();
      const result = await collection.find();

      expect(result).toBeNull();
    });

    it("Should throw error if id, name  not provided", async () => {
      jest.spyOn(collection, "findById").mockImplementation(() => {
        throw new Error("At least one of id, name or slug must be provided");
      });

      collection.id = undefined;
      collection.name = undefined;

      expect(() => collection.find({})).toThrow(
        "At least one of id, name or slug must be provided"
      );
    });

    it("Should return collection object if found", async () => {
      jest
        .spyOn(collection, "save")
        .mockResolvedValue(mockCollectionReturnValue);

      collection.name = collectionData.name;
      collection.description = collectionData.description;
      collection.tags = collectionData.tags;
      await collection.save();

      jest
        .spyOn(collection, "find")
        .mockResolvedValue(mockCollectionReturnValue);

      const result = await collection.find();

      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("findById", () => {
    it("Should return null if collection not found", async () => {
      jest.spyOn(collection, "findById").mockResolvedValue(null);

      collection.id = "invalid_collection_id";
      const result = await collection.findById();

      expect(result).toBeNull();
    });

    it("Should return collection object if found", async () => {
      jest
        .spyOn(collection, "findById")
        .mockResolvedValue(mockCollectionReturnValue);

      jest.spyOn(collection, "save").mockResolvedValue(mockUserReturnValue);

      collection.authorId = userData.id;
      const saved = await collection.save();
      collection.id = saved.id;
      const result = await collection.findById();

      expect(result).toMatchObject(mockCollectionReturnValue);
    });
  });

  describe("update", () => {
    it("Should return null if collection.id invalid", async () => {
      jest.spyOn(collection, "save").mockResolvedValue(null);

      collection.id = "invalid_collection_id";
      const result = await collection.update();

      expect(result).toBeNull();
    });

    it("should return the updated user object", async () => {
      jest
        .spyOn(collection, "save")
        .mockResolvedValue(mockCollectionReturnValue);

      collection.name = collectionData.name;
      collection.description = collectionData.description;
      const saved = await collection.save();

      const newname = faker.internet.username();

      jest
        .spyOn(collection, "update")
        .mockResolvedValue({ ...saved, name: newname });

      collection.id = saved.id;
      collection.name = newname;

      const result = await collection.update();

      expect(result).toMatchObject({
        ...mockCollectionReturnValue,
        name: newname,
      });
    });
  });

  describe("delete", () => {
    it("Should return true if collection deleted", async () => {
      jest
        .spyOn(collection, "save")
        .mockResolvedValue(mockCollectionReturnValue);

      const saved = await collection.save();

      jest
        .spyOn(collection, "delete")
        .mockResolvedValue(mockCollectionReturnValue);

      collection.id = saved.id;
      const result = await collection.delete();

      expect(result).toBeTruthy();
    });

    it("Should return false if invalid collection provided", async () => {
      jest.spyOn(collection, "delete").mockResolvedValue(null);

      collection.id = "invalid_collection_id";
      const result = await collection.delete();

      expect(result).toBeNull();
    });
  });
});
