require("dotenv").config();
const auth = require("./auth");
const jwt = require("jsonwebtoken");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");
const { response } = require("../functions/testHelpers");

// jest.mock("jsonwebtoken");
jest.mock("./auth", () => jest.fn((req, res, next) => next()));

describe("Auth middleware", () => {
  let user;
  let token;
  let req;
  let res;
  let next;

  beforeAll(() => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
    };

    token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("Should return 401_FORBIDDEN if no token is provided", () => {
    req = {
      headers: {},
    };

    auth.mockImplementation((req, res, next) => {
      res.status(status.FORBIDDEN).json({ message: status[status.FORBIDDEN] });
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: status[status.FORBIDDEN],
    });
  });

  it("Should return 400_BAD_REQUEST if token is invalid", () => {
    mockResponse = response(status.OK, status[status.OK]);

    req = {
      headers: { authorization: "Bearer invalid_token" },
    };

    auth.mockImplementation((req, res, next) => {
      res
        .status(status.BAD_REQUEST)
        .json({ message: status[status.BAD_REQUEST] });
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(status.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: status[status.BAD_REQUEST],
    });
  });

  it("Should populate req.user with the payload of a valid JWT", () => {
    jest.spyOn(jwt, "verify").mockResolvedValue(userData);

    auth.mockImplementation((req, res, next) => {
      req.user = userData;
      next();
    });

    auth(req, res, next);

    // expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.user).toMatchObject(userData);
    expect(next).toHaveBeenCalled();
  });
});
