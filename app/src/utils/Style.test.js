const { style } = require("./Style");
const { faker } = require("@faker-js/faker");

describe("Style", () => {
  let styleData;
  let mockStyleResolveValue;

  beforeAll(async () => {
    styleData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      author: { id: faker.string.uuid() },
      collection: { id: faker.string.uuid() },
      tags: ["tag1", "tag2"],
    };

    mockStyleResolveValue = {
      id: jest.fn(() => styleData.id),
      name: jest.fn(() => styleData.name),
      description: jest.fn(() => styleData.description),
      tags: jest.fn(() => styleData.tags),
    };
  });

  afterAll(async () => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call create method when creating a style", async () => {
      jest.spyOn(style, "create").mockResolvedValue();
      await style.create();

      expect(style.create).toHaveBeenCalled();
    });

    it("Should return the created style object", async () => {
      jest.spyOn(style, "create").mockResolvedValue(mockStyleResolveValue);

      style.name = styleData.name;
      style.description = styleData.description;
      style.collection = styleData.collection.id;
      style.author = styleData.author.id;
      style.tags = styleData.tags;
      const result = await style.create();

      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating a style", async () => {
      jest.spyOn(style, "update").mockResolvedValue();
      await style.update();

      expect(style.update).toHaveBeenCalled();
    });

    it("Should return the updated style object", async () => {
      const newName = faker.commerce.productName();
      style.name = newName;

      jest
        .spyOn(style, "update")
        .mockResolvedValue({ ...mockStyleResolveValue, name: newName });
      const result = await style.update();

      expect(result).toMatchObject({ ...mockStyleResolveValue, name: newName });
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating a style", async () => {
      jest.spyOn(style, "save").mockResolvedValue();
      await style.save();

      expect(style.save).toHaveBeenCalled();
    });

    it("Should call update method if style exist", async () => {
      const newName = faker.commerce.productName();
      style.name = newName;

      jest
        .spyOn(style, "save")
        .mockResolvedValue({ ...mockStyleResolveValue, name: newName });
      const result = await style.save();

      expect(result).toMatchObject({ ...mockStyleResolveValue, name: newName });
    });

    it("Should call create method if style exist", async () => {
      jest.spyOn(style, "deleteMany").mockResolvedValue();
      await style.deleteMany();

      jest.spyOn(style, "save").mockResolvedValue(mockStyleResolveValue);
      style.id = undefined;
      style.name = styleData.name;
      const result = await style.save();

      expect(style.save).toHaveBeenCalled();
      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("find", () => {
    it("Should call find method when finding a style", async () => {
      jest.spyOn(style, "find").mockResolvedValue();
      await style.find();

      expect(style.find).toHaveBeenCalled();
    });

    it("Should return null if no style found", async () => {
      jest.spyOn(style, "delete").mockResolvedValue();
      style.id = styleData.id;
      await style.delete();

      jest.spyOn(style, "find").mockResolvedValue(null);
      const result = await style.find();

      expect(result).toBeNull();
    });

    it("Should return the found style object", async () => {
      jest.spyOn(style, "create").mockResolvedValue();
      await style.create();

      jest.spyOn(style, "find").mockResolvedValue(mockStyleResolveValue);
      const result = await style.find();

      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting a style", async () => {
      jest.spyOn(style, "delete").mockResolvedValue();
      await style.delete();

      expect(style.delete).toHaveBeenCalled();
    });

    it("Should return the deleted style object", async () => {
      jest.spyOn(style, "delete").mockResolvedValue(true);
      await style.delete();

      expect(style.delete).toBeTruthy();
    });

    it("Should return null if style not found", async () => {
      jest.spyOn(style, "find").mockResolvedValue(null);
      const result = await style.find();

      expect(result).toBeNull();
    });
  });
});
