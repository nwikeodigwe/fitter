const mailconf = require("../config/mailconf");
const prisma = require("../functions/prisma");
const User = require("./User");
const { faker } = require("@faker-js/faker");

describe("User", () => {
  let user;
  let userData;
  let mockUserReturnValue;

  beforeAll(() => {
    user = new User();
  });

  beforeEach(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await prisma.user.deleteMany();
  });

  describe("create", () => {
    it("Should call save method when creating a user", async () => {
      user.email = userData.email;
      user.password = userData.password;

      mockcreate = jest.spyOn(user, "create").mockResolvedValue();
      await user.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created user object", async () => {
      user.email = userData.email;
      const result = await user.create();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email", userData.email);
      expect(result).toHaveProperty("name");

      mockcreate.mockRestore();
    });
  });

  describe("find", () => {
    it("Should return null if user not found", async () => {
      const result = await user.find({ id: "invalid_user_id" });

      expect(result).toBeNull();
    });

    it("Should throw error if id, name and email not provided", async () => {
      user.id = undefined;
      user.name = undefined;
      user.email = undefined;

      expect(() => user.find({})).toThrow(
        "At least one of id, name, or email must be provided"
      );
    });

    it("Should return user object if found", async () => {
      user.email = userData.email;
      user.password = userData.password;

      await user.save();
      const result = await user.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email", userData.email);
      expect(result).toHaveProperty("name");
    });
  });

  describe("findById", () => {
    it("Should return null if user not found", async () => {
      user.id = "invalid_user_id";
      const result = await user.findById();

      expect(result).toBeNull();
    });

    it("Should return user object if found", async () => {
      const saved = await user.save();
      user.id = saved.id;
      const result = await user.findById();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("email", saved.email);
      expect(result).toHaveProperty("name", saved.name);
    });
  });

  describe("findMany", () => {
    it("Should return empty array is no user found", async () => {
      const users = await user.findMany();

      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(0);
    });

    it("Should return array of users if exist", async () => {
      user.email = userData.email;
      await user.save();
      const result = await user.findMany();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("email", userData.email);
      expect(result[0]).toHaveProperty("name");
    });
  });

  describe("update", () => {
    it("Should return null if user.id invalid", async () => {
      user.id = "invalid_user_id";
      const update = await user.update();

      expect(update).toBeNull();
    });

    it("should return the updated user object", async () => {
      const saved = await user.save();
      const newname = faker.internet.username();
      user.id = saved.id;
      user.name = newname;

      const result = await user.update();

      expect(result).toHaveProperty("id", saved.id);
      expect(result).toHaveProperty("name", newname);
      expect(result).toHaveProperty("email");
    });
  });

  describe("passwordMatch", () => {
    it("Should return false if password does not match", async () => {
      await user.save();

      user.password = "wrongpassword";
      const isPassword = await user.passwordMatch();

      expect(isPassword).toBeFalsy();
    });

    it("Should return true if password match", async () => {
      await user.save();

      const isPassword = await user.passwordMatch();

      expect(isPassword).toBeTruthy();
    });
  });

  describe("subscribeTo", () => {
    it("Should return false if no id proivided", async () => {
      const result = await user.subscribeTo("invalid_user_id");
      expect(result).toBeNull();
    });

    it("Should return id when subsribed to user", async () => {
      const saved = await user.save();

      const result = await user.subscribeTo(saved.id);

      expect(result).toHaveProperty("id");
      expect(result).toBeTruthy();
    });
  });

  describe("isSubscribeTo", () => {
    it("Should return false if Id not provided", async () => {
      const result = await user.isSubscribedTo();
      expect(result).toBeFalsy();
    });

    it("Should return true if subsribed to user", async () => {
      const saved = await user.save();
      await user.subscribeTo(saved.id);
      const result = await user.isSubscribedTo(saved.id);

      expect(result).toBeTruthy();
    });
  });

  describe("unsubscribeFrom", () => {
    it("Should return false no id proiveded to unsubscribe from", async () => {
      const result = await user.unsubscribeFrom();
      expect(result).toBeNull();
    });

    it("Should return id if unsubscribe from user", async () => {
      const saved = await user.save();
      await user.subscribeTo(saved.id);
      const result = await user.unsubscribeFrom(saved.id);

      expect(result).toHaveProperty("id");
    });
  });

  describe("hashPassword", () => {
    it("Should return false if no password provided", async () => {
      user.password = undefined;
      const result = await user.hashPassword();
      expect(result).toBeFalsy();
    });

    it("Should return hash if password provided", async () => {
      user.password = userData.password;
      const result = await user.hashPassword();

      expect(result).toBeTruthy();
    });
  });

  describe("generateAccessToken", () => {
    it("Should return false if user is invalid", async () => {
      user.id = "invalid_user_id";
      const result = await user.generateAccessToken();

      expect(result).toBeNull();
    });

    it("Should return token if user provided", async () => {
      await user.save();
      const result = await user.generateAccessToken();

      expect(result).toBeTruthy();
    });
  });

  describe("generateRefreshToken", () => {
    it("Should return false if token not provided", async () => {
      user.id = undefined;
      user.email = undefined;
      const result = await user.generateRefreshToken();
      expect(result).toBeFalsy();
    });

    it("Should return generated token if user provided", async () => {
      user.email = userData.email;
      user.password = userData.password;
      const saved = await user.save();
      user.id = saved.id;
      const result = await user.generateAccessToken();

      expect(result).toBeTruthy();
    });
  });

  describe("verifyToken", () => {
    it("Should return false if invalid token provided", async () => {
      const result = await user.verifyToken("invalidtoken");
      expect(result).toBeFalsy();
    });

    it("Should return true if valid token", async () => {
      await user.save();
      const token = await user.generateAccessToken();
      const decode = await user.verifyToken(token);

      expect(decode).toBeTruthy();
    });
  });

  describe("login", () => {
    it("Should generate access and refresh token", async () => {
      await user.save();

      const result = await user.login();

      expect(result).toBeTruthy();
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refresh");
    });
  });

  describe("mail", () => {
    it("Should return true if mail sent to user", async () => {
      await user.save();

      mocksend = jest.spyOn(user, "mail").mockResolvedValue(true);

      const result = await user.mail(mailconf.welcome);

      expect(mocksend).toHaveBeenCalled();
      expect(result).toBeTruthy();
      mocksend.mockRestore();
    });
  });

  describe("createResetToken", () => {
    it("Should return true if reset token created", async () => {
      await user.save();
      const result = await user.createResetToken();

      expect(result).toBeTruthy();
    });
  });

  describe("isValidResetToken", () => {
    it("Should return false if reset token invalid", async () => {
      await user.save();
      user.resetToken = "invalid_reset_token";
      const result = await user.isValidResetToken();

      expect(result).toBeFalsy();
    });

    it("Should return true if reset token is valid", async () => {
      await user.save();
      const reset = await user.createResetToken();
      user.resetToken = reset.token;
      const result = await user.isValidResetToken();

      expect(result).toBeTruthy();
    });
  });

  describe("delete", () => {
    it("Should return false if invalid user provided", async () => {
      user.id = "invalid_user_id";
      const result = await user.delete();

      expect(result).toBeNull();
    });

    it("Should return false if invalid user provided", async () => {
      await user.save();
      const result = await user.delete();

      expect(result).toBeTruthy();
    });
  });

  describe("deleteMany", () => {
    it("Should return true if user deleted", async () => {
      await user.save();
      const result = await user.deleteMany();

      expect(result).toBeTruthy();
    });
  });
});
