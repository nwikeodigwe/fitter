// logger.test.js
const { logger } = require("./Logger");

describe("Logger", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe("info method", () => {
    it("should call the underlying winston.info method", () => {
      jest.spyOn(logger, "info");
      const message = "Test info message";
      const meta = { key: "value" };

      logger.info(message, meta);

      expect(logger.info).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("error method", () => {
    it("should call the underlying winston.error method", () => {
      jest.spyOn(logger, "error");
      const message = "Test error message";
      const meta = { error: true };

      logger.error(message, meta);

      expect(logger.error).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("warn method", () => {
    it("should call the underlying winston.warn method", () => {
      jest.spyOn(logger, "warn");
      const message = "Test warn message";
      const meta = { warning: true };

      logger.warn(message, meta);

      expect(logger.warn).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("debug method", () => {
    it("should call the underlying winston.debug method", () => {
      jest.spyOn(logger, "debug");
      const message = "Test debug message";
      const meta = { debug: true };

      logger.debug(message, meta);

      expect(logger.debug).toHaveBeenCalledWith(message, meta);
    });
  });
});
