const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { mail } = require("./Mail");
const { faker } = require("@faker-js/faker");
const { resend } = require("../startup/resend");

describe("Mail", () => {
  let contentData = {};

  beforeAll(() => {
    contentData = {
      email: faker.internet.email(),
      subject: "Test Subject",
      from: `Sender <${faker.internet.email()}>`,
      attr: { extra: "data" },
    };
  });

  afterAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe("Main.template()", () => {
    it("should compile the handlebars template with provided context", () => {
      const fakeTemplate = "Hello, {{name}}!";
      const compiledOutput = "Hello, John!";

      jest.spyOn(path, "join").mockReturnValue("path/to/template");
      const readFileSpy = jest
        .spyOn(fs, "readFileSync")
        .mockReturnValue(fakeTemplate);
      const compileSpy = jest
        .spyOn(handlebars, "compile")
        .mockReturnValue(() => compiledOutput);

      const context = { name: "John" };
      const result = mail.template("welcome", context);

      expect(path.join).toHaveBeenCalledWith(
        __dirname,
        "../emails",
        "welcome.hbs"
      );
      expect(readFileSpy).toHaveBeenCalledWith("path/to/template", "utf-8");
      expect(compileSpy).toHaveBeenCalledWith(fakeTemplate);
      expect(result).toBe(compiledOutput);

      readFileSpy.mockRestore();
      compileSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe("Mail.content()", () => {
    it("should correctly set mail properties from htmlContent", () => {
      mail.from = "default@domain.com"; // simulate default

      const htmlContent = {
        email: "john@example.com",
        subject: "Welcome",
        from: "support@example.com",
        attr: { promo: true },
      };

      mail.content(htmlContent);

      expect(mail.htmlContent).toEqual(htmlContent);
      expect(mail.to).toBe("john@example.com");
      expect(mail.subject).toBe("Welcome");
      expect(mail.from).toBe("support@example.com");
      expect(mail.attr).toEqual({ promo: true });
    });

    it("should use defaults if from or attr are missing", () => {
      mail.from = "default@domain.com";

      const htmlContent = {
        email: "jane@example.com",
        subject: "Hi Jane!",
      };

      mail.content(htmlContent);

      expect(mail.htmlContent).toEqual(htmlContent);
      expect(mail.to).toBe("jane@example.com");
      expect(mail.subject).toBe("Hi Jane!");
      expect(mail.from).toBe("default@domain.com");
      expect(mail.attr).toEqual({});
    });
  });

  describe("Mail.send()", () => {
    it("should call resend.emails.send with the correct parameters", async () => {
      jest.spyOn(mail, "template").mockReturnValue("<html>Welcome</html>");
      jest.spyOn(resend.emails, "send").mockResolvedValue({ success: true });
      jest.spyOn(mail, "send");

      const result = await mail.send("welcome");

      expect(resend.emails.send).toHaveBeenCalled();
      expect(mail.send).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});
