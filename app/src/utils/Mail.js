const { Resend } = require("resend");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

class Mail {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_USER;

    this.WELCOME = "welcome";
    this.WELCOME_SUBJECT = "Welcome to Resend";
    this.WELCOME_FROM = "Acme <onboarding@resend.dev>";
  }

  template(templateName = "welcome", context = {}) {
    this.templateName = templateName;
    const filePath = path.join(
      __dirname,
      "../emails",
      `${this.templateName}.hbs`
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const tmp = handlebars.compile(source);
    return tmp(context);
  }

  content(htmlContent) {
    this.htmlContent = htmlContent;
    this.to = htmlContent.email;
    this.subject = htmlContent.subject;
    this.from = htmlContent.from || this.from;
    this.attr = htmlContent.attr || {};
  }

  async send(emailTemplate) {
    return await this.resend.emails.send({
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.template(emailTemplate, {
        ...this.htmlContent,
        ...this.attr,
      }),
    });
  }
}

module.exports = new Mail();
