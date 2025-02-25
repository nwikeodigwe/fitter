const request = require("supertest");
let app;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("./src/app");
  });
  afterEach(() => {
    server.close();
  });
  describe("POST /login", () => {});
});
