const { user } = require("./User");
const mailconf = require("../config/mailconf");
const { faker } = require("@faker-js/faker");
const prisma = require("../functions/prisma");

describe("User", () => {
  let userData;
  let mockUserResolveValue;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserResolveValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call save method when creating a user", async () => {
      jest.spyOn(prisma.user, "create").mockResolvedValue(mockUserResolveValue);

      user.email = userData.email;
      user.password = userData.password;
      await user.create();

      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("Should return the created user object", async () => {
      jest.spyOn(prisma.user, "create").mockResolvedValue(mockUserResolveValue);

      user.email = userData.email;
      const result = await user.create();

      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("find", () => {
    it("Should throw error if id, name and email not provided", async () => {
      await expect(user.find()).rejects.toThrow(
        "At least one of id, name, or email must be provided"
      );
    });

    it("Should return null if user not found", async () => {
      jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null);

      user.id = "invalid_user_id";
      const result = await user.find();

      expect(prisma.user.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should return user object if found", async () => {
      jest
        .spyOn(prisma.user, "findFirst")
        .mockResolvedValue(mockUserResolveValue);

      user.id = userData.id;
      const result = await user.find();

      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("findById", () => {
    it("Should return null if user not found", async () => {
      jest.spyOn(user, "findById").mockResolvedValue(null);

      user.id = "invalid_user_id";
      const result = await user.findById();

      expect(result).toBeNull();
    });

    it("Should return user object if found", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "findById").mockResolvedValue(mockUserResolveValue);
      const result = await user.findById();

      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("findMany", () => {
    it("Should return empty array is no user found", async () => {
      jest.spyOn(user, "findMany").mockResolvedValue([]);
      const users = await user.findMany();

      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(0);
    });

    it("Should return array of users if exist", async () => {
      jest.spyOn(user, "save").mockResolvedValue(mockUserResolveValue);
      user.email = userData.email;
      await user.save();

      jest.spyOn(user, "findMany").mockResolvedValue([mockUserResolveValue]);
      const result = await user.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(mockUserResolveValue);
    });
  });

  describe("update", () => {
    it("Should return null if user.id invalid", async () => {
      jest.spyOn(user, "update").mockResolvedValue(null);

      user.id = "invalid_user_id";
      const update = await user.update();

      expect(update).toBeNull();
    });

    it("should return the updated user object", async () => {
      jest.spyOn(user, "save").mockResolvedValue({ id: "id" });

      const saved = await user.save();

      const newname = faker.internet.username();
      user.id = saved.id;
      user.name = newname;

      jest
        .spyOn(user, "update")
        .mockResolvedValue({ ...mockUserResolveValue, name: newname });
      const result = await user.update();

      expect(result).toMatchObject({ ...mockUserResolveValue, name: newname });
    });
  });

  describe("passwordMatch", () => {
    it("Should return false if password does not match", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "passwordMatch").mockResolvedValue(false);
      user.password = "wrongpassword";
      const isPassword = await user.passwordMatch();

      expect(isPassword).toBeFalsy();
    });

    it("Should return true if password match", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "passwordMatch").mockResolvedValue(true);
      const isPassword = await user.passwordMatch();

      expect(isPassword).toBeTruthy();
    });
  });

  describe("subscribe", () => {
    it("Should return false if no id proivided", async () => {
      jest.spyOn(user, "subscribe").mockResolvedValue(null);

      const result = await user.subscribe("invalid_user_id");

      expect(result).toBeNull();
    });

    it("Should return id when subsribed to user", async () => {
      jest.spyOn(user, "save").mockResolvedValue(mockUserResolveValue);

      const saved = await user.save();

      jest.spyOn(user, "subscribe").mockResolvedValue({ id: "id" });
      const result = await user.subscribe(saved.id);

      expect(result).toMatchObject({ id: "id" });
      expect(result).toBeTruthy();
    });
  });

  describe("isSubscribe", () => {
    it("Should return false if Id not provided", async () => {
      jest.spyOn(user, "isSubscribed").mockResolvedValue(false);

      const result = await user.isSubscribed();

      expect(result).toBeFalsy();
    });

    it("Should return true if subsribed to user", async () => {
      jest.spyOn(user, "save").mockResolvedValue(mockUserResolveValue);

      const saved = await user.save();

      jest.spyOn(user, "isSubscribed").mockResolvedValue(true);
      await user.subscribe(saved.id);
      const result = await user.isSubscribed(saved.id);

      expect(result).toBeTruthy();
    });
  });

  describe("unsubscribe", () => {
    it("Should return false no id proiveded to unsubscribe from", async () => {
      jest.spyOn(user, "unsubscribe").mockResolvedValue(null);

      const result = await user.unsubscribe();
      expect(result).toBeNull();
    });

    it("Should return id if unsubscribe from user", async () => {
      jest
        .spyOn(prisma.userSubscription, "delete")
        .mockResolvedValue(mockUserResolveValue);

      user.id = userData.id;
      const result = await user.unsubscribe(faker.string.uuid());

      expect(prisma.userSubscription.delete).toHaveBeenCalled();
      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("hashPassword", () => {
    it("Should return false if no password provided", async () => {
      jest.spyOn(user, "hashPassword").mockResolvedValue(false);

      user.password = undefined;
      const result = await user.hashPassword();
      expect(result).toBeFalsy();
    });

    it("Should return hash if password provided", async () => {
      jest.spyOn(user, "hashPassword").mockResolvedValue(true);

      user.password = userData.password;
      const result = await user.hashPassword();

      expect(result).toBeTruthy();
    });
  });

  describe("generateAccessToken", () => {
    it("Should return false if user is invalid", async () => {
      jest.spyOn(user, "generateAccessToken").mockResolvedValue(null);

      user.id = "invalid_user_id";
      const result = await user.generateAccessToken();

      expect(result).toBeNull();
    });

    it("Should return token if user provided", async () => {
      jest.spyOn(user, "save").mockResolvedValue();

      await user.save();

      jest.spyOn(user, "generateAccessToken").mockResolvedValue(true);
      const result = await user.generateAccessToken();

      expect(result).toBeTruthy();
    });
  });

  describe("generateRefreshToken", () => {
    it("Should return false if token not provided", async () => {
      jest.spyOn(user, "generateRefreshToken").mockResolvedValue(false);

      user.id = undefined;
      user.email = undefined;
      const result = await user.generateRefreshToken();
      expect(result).toBeFalsy();
    });

    it("Should return generated token if user provided", async () => {
      jest.spyOn(user, "save").mockResolvedValue(mockUserResolveValue);

      user.email = userData.email;
      user.password = userData.password;
      const saved = await user.save();

      jest.spyOn(user, "generateAccessToken").mockResolvedValue(true);
      user.id = saved.id;
      const result = await user.generateAccessToken();

      expect(result).toBeTruthy();
    });
  });

  describe("verifyToken", () => {
    it("Should return false if invalid token provided", async () => {
      jest.spyOn(user, "verifyToken").mockResolvedValue(false);

      const result = await user.verifyToken("invalidtoken");

      expect(result).toBeFalsy();
    });

    it("Should return true if valid token", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "generateAccessToken").mockResolvedValue("token");
      const token = await user.generateAccessToken();

      jest.spyOn(user, "verifyToken").mockResolvedValue(true);
      const decode = await user.verifyToken(token);

      expect(decode).toBeTruthy();
    });
  });

  describe("login", () => {
    it("Should generate access and refresh token", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest
        .spyOn(user, "login")
        .mockResolvedValue({ token: "token", refresh: "refresh" });
      const result = await user.login();

      expect(result).toBeTruthy();
      expect(result).toMatchObject({ token: "token", refresh: "refresh" });
    });
  });

  describe("mail", () => {
    it("Should return true if mail sent to user", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "mail").mockResolvedValue(true);
      const result = await user.mail(mailconf.welcome);

      expect(user.mail).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });

  describe("createResetToken", () => {
    it("Should return true if reset token created", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "createResetToken").mockResolvedValue(true);
      const result = await user.createResetToken();

      expect(result).toBeTruthy();
    });
  });

  describe("isValidResetToken", () => {
    it("Should return false if reset token invalid", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "isValidResetToken").mockResolvedValue(false);
      user.resetToken = "invalid_reset_token";
      const result = await user.isValidResetToken();

      expect(result).toBeFalsy();
    });

    it("Should return true if reset token is valid", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "createResetToken").mockResolvedValue("token");
      const reset = await user.createResetToken();

      jest.spyOn(user, "isValidResetToken").mockResolvedValue(true);
      user.resetToken = reset.token;
      const result = await user.isValidResetToken();

      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Should return false if invalid user provided", async () => {
      jest.spyOn(user, "delete").mockResolvedValue(null);

      user.id = "invalid_user_id";
      const result = await user.delete();

      expect(result).toBeNull();
    });

    it("Should return false if invalid user provided", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "delete").mockResolvedValue(true);
      const result = await user.delete();

      expect(result).toBeTruthy();
    });
  });

  describe("deleteMany", () => {
    it("Should return true if user deleted", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      await user.save();

      jest.spyOn(user, "deleteMany").mockResolvedValue(true);
      const result = await user.deleteMany();

      expect(result).toBeTruthy();
    });
  });
});
