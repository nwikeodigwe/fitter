const { styles } = require("./style");
const prisma = require("../functions/prisma");
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
      jest.spyOn(prisma.style, "create").mockResolvedValue({ id: "style_id" });

      await styles.create();

      expect(prisma.style.create).toHaveBeenCalled();
    });

    it("Should return the created style object", async () => {
      jest
        .spyOn(prisma.style, "create")
        .mockResolvedValue(mockStyleResolveValue);

      styles.name = styleData.name;
      styles.description = styleData.description;
      styles.collection = styleData.collection.id;
      styles.author = styleData.author.id;
      styles.tags = styleData.tags;
      const result = await styles.create();

      expect(prisma.style.create).toHaveBeenCalled();
      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating a style", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.style, "update").mockResolvedValue();

      styles.name = faker.commerce.product();
      await styles.update();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(prisma.style.update).toHaveBeenCalled();
    });

    it("Should return the updated style object", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(true);

      const newName = faker.commerce.productName();
      styles.name = newName;

      jest
        .spyOn(prisma.style, "update")
        .mockResolvedValue({ ...mockStyleResolveValue, name: newName });

      const result = await styles.update();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(prisma.style.update).toHaveBeenCalled();
      expect(result).toMatchObject({ ...mockStyleResolveValue, name: newName });
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating a style", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue();
      await styles.save();

      expect(prisma.style.findFirst).toHaveBeenCalled();
    });

    it("Should call update method if style exist", async () => {
      const newName = faker.commerce.productName();
      styles.name = newName;

      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(true);
      jest
        .spyOn(prisma.style, "update")
        .mockResolvedValue({ ...mockStyleResolveValue, name: newName });

      const result = await styles.save();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(prisma.style.update).toHaveBeenCalled();
      expect(result).toMatchObject({ ...mockStyleResolveValue, name: newName });
    });

    it("Should call create method if style exist", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(null);
      jest
        .spyOn(prisma.style, "create")
        .mockResolvedValue(mockStyleResolveValue);

      styles.id = undefined;
      styles.name = styleData.name;
      const result = await styles.save();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(prisma.style.create).toHaveBeenCalled();
      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("find", () => {
    it("Should call find method when finding a style", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue();

      await styles.find();

      expect(prisma.style.findFirst).toHaveBeenCalled();
    });

    it("Should return null if no style found", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(null);

      const result = await styles.find();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should return the found style object", async () => {
      jest
        .spyOn(prisma.style, "findFirst")
        .mockResolvedValue(mockStyleResolveValue);

      const result = await styles.find();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(result).toMatchObject(mockStyleResolveValue);
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting a style", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.style, "delete").mockResolvedValue();

      styles.id = "style_id";
      await styles.delete();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(prisma.style.delete).toHaveBeenCalled();
    });

    it("Should return the deleted style object", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(true);
      jest
        .spyOn(prisma.style, "delete")
        .mockResolvedValue(mockStyleResolveValue);

      await styles.delete();

      expect(prisma.style.findFirst).toHaveBeenCalled();
      expect(styles.delete).toBeTruthy();
    });

    it("Should return null if style not found", async () => {
      jest.spyOn(prisma.style, "findFirst").mockResolvedValue(null);

      styles.id = "style_id";
      await styles.delete();

      expect(prisma.style.findFirst).toHaveBeenCalled();
    });
  });
});
