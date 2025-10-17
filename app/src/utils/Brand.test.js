const { Brand } = require("./Brand");
const { faker } = require("@faker-js/faker");
const { User } = require("./User");

describe("Brand", () => {
  let user;
  let brand;
  let userData;
  let brandData;
  let mockcreate;
  let mockfind;
  let mockUserReturnValue;
  let mockBrandReturnValue;

  beforeAll(() => {
    user = new User();
    brand = new Brand();
  });

  beforeEach(async () => {
    jest.resetModules();
    // user.email = faker.internet.email();
    // user.password = faker.internet.password();
    // await user.save();

    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
    };

    brandData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.commerce.productDescription(),
      tags: ["tag1", "tag2"],
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };

    mockBrandReturnValue = {
      id: jest.fn(() => brandData.id),
      name: jest.fn(() => brandData.name),
      description: jest.fn(() => brandData.description),
    };
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call save method when creating a brand", async () => {
      jest.spyOn(brand, "create").mockResolvedValue();

      brand.name = brandData.name;
      brand.description = brandData.description;

      await brand.create();

      expect(brand.create).toHaveBeenCalled();
    });

    it("Should return the created user object", async () => {
      jest.spyOn(brand, "create").mockResolvedValue(brandData);
      brand.tags = brandData.tags;
      const result = await brand.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("tags");
    });
  });

  describe("find", () => {
    it("Should return null if brand not found", async () => {
      jest.spyOn(brand, "find").mockResolvedValue(null);
      const result = await brand.find({ id: "invalid_brand_id" });

      expect(result).toBeNull();
    });

    it("Should throw error if id, name  not provided", async () => {
      jest.spyOn(brand, "find").mockImplementation(() => {
        throw new Error("At least one of id, name or slug must be provided");
      });

      brand.id = undefined;
      brand.name = undefined;

      expect(() => brand.find({})).toThrow(
        "At least one of id, name or slug must be provided"
      );
    });

    it("Should return brand object if found", async () => {
      jest.spyOn(brand, "save").mockResolvedValue(mockBrandReturnValue);
      jest.spyOn(brand, "find").mockResolvedValue(mockBrandReturnValue);

      brand.name = brandData.name;
      brand.description = brandData.description;
      //   brand.owner = user.id;

      await brand.save();
      const result = await brand.find();

      expect(result).toMatchObject(mockBrandReturnValue);
    });
  });

  describe("findById", () => {
    it("Should return null if brand not found", async () => {
      jest.spyOn(brand, "findById").mockResolvedValue(null);

      brand.id = "invalid_brand_id";
      const result = await brand.findById();

      expect(result).toBeNull();
    });

    it("Should return brand object if found", async () => {
      jest.spyOn(brand, "findById").mockResolvedValue(mockBrandReturnValue);

      brand.id = brandData.id;
      const result = await brand.findById();

      expect(result).toMatchObject(mockBrandReturnValue);
    });
  });

  describe("update", () => {
    it("Should return null if brand.id invalid", async () => {
      jest.spyOn(brand, "update").mockResolvedValue(null);

      brand.id = "invalid_brand_id";
      const update = await brand.update();

      expect(update).toBeNull();
    });

    it("Should return the updated user object", async () => {
      jest.spyOn(brand, "save").mockResolvedValue(mockBrandReturnValue);

      brand.name = brandData.name;
      brand.description = brandData.description;

      const saved = await brand.save();

      const newname = faker.internet.username();

      jest
        .spyOn(brand, "update")
        .mockResolvedValue({ ...saved, name: newname });

      brand.id = saved.id;
      brand.tags = ["tag1", "tag2"];
      brand.name = newname;

      const result = await brand.update();

      expect(result).toMatchObject({ ...saved, name: newname });
    });
  });

  describe("delete", () => {
    it("Should return false if invalid brand provided", async () => {
      jest.spyOn(brand, "delete").mockResolvedValue(null);

      brand.id = "invalid_brand_id";
      const result = await brand.delete();

      expect(result).toBeNull();
    });

    it("Should return false if invalid brand provided", async () => {
      jest.spyOn(brand, "save").mockResolvedValue(mockBrandReturnValue);
      jest.spyOn(brand, "delete").mockResolvedValue(mockBrandReturnValue);

      await brand.save();
      const result = await brand.delete();

      expect(result).toBeTruthy();
    });
  });
});
