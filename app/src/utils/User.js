const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rug = require("random-username-generator");
const logger = require("./logger");
const prisma = require("../functions/prisma");
const { mail } = require("./mail");
const template = require("../const/mail.json");

class User {
  constructor(user = {}) {
    this.user = {};
    this.id = user.id || null;
    this.name = user.name || null;
    this.email = user.email || null;
    this.password = user.password || null;
    this.resetToken = user.resetToken || null;

    this.selectedFields = {
      id: true,
      name: true,
      email: true,
    };
  }

  async save(user = {}) {
    this.email = user.email || this.email;
    this.password = user.password || this.password;
    this.name = user.name || this.name;
    const id = user.id || this.id;

    user = await this.find({ id, email: this.email });

    return user ? this.update({ id: user.id }) : this.create();
  }

  create(user = {}) {
    try {
      const email = user.email || this.email;
      const password = user.password || this.password;
      const name = rug.generate(email.split("@")[0]);

      return prisma.user.create({
        data: { name, email, password: bcrypt.hashSync(password, 10) },
        select: this.selectedFields,
      });
    } catch (err) {
      this.id = null;
      this.name = null;
      logger.error(err);
    }
  }

  async update(user = {}) {
    try {
      const id = user.id || this.id;
      const email = user.email || this.email;
      const password = user.password || this.password;
      const name = user.name || this.name;
      return prisma.user.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(password ? { password: bcrypt.hashSync(password, 10) } : {}),
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err.message);
    }
  }

  async find(user = {}) {
    try {
      const id = user.id || this.id;
      const name = user.name || this.name;
      const email = user.email || this.email;

      const filters = [
        id && { id },
        name && { name },
        email && { email },
      ].filter(Boolean);

      if (filters.length === 0) {
        throw new Error("At least one of id, name, or email must be provided");
      }

      return prisma.user.findFirst({
        where: {
          OR: filters,
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  findById(id = this.id) {
    try {
      return prisma.user.findUnique({
        where: {
          id,
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
    }
  }

  findMany(where = {}) {
    try {
      return prisma.user.findMany({
        where,
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
    }
  }

  isSubscribed(user) {
    try {
      return prisma.userSubscription.findFirst({
        where: {
          userId: user,
          subscriberId: this.id,
        },
        select: { id: true },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  async subscribe(id) {
    try {
      return await prisma.userSubscription.create({
        data: {
          subscriber: {
            connect: {
              id: this.id,
            },
          },
          user: {
            connect: {
              id,
            },
          },
        },
        select: {
          id: true,
        },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  unsubscribe(id) {
    try {
      return prisma.userSubscription.delete({
        where: {
          userId_subscriberId: {
            userId: id,
            subscriberId: this.id,
          },
        },
        select: {
          id: true,
        },
      });
    } catch (err) {
      logger.error(err);
    }
  }

  async #getPassword() {
    const id = this.id;
    const email = this.email;

    const filters = [id && { id }, email && { email }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: filters,
      },
      select: { password: true },
    });
    return user.password;
  }

  hashPassword(password = this.password) {
    try {
      return bcrypt.hashSync(password, 10);
    } catch (err) {
      logger.error(err);
    }
  }

  async passwordMatch(password = this.password) {
    const passwordHash = await this.#getPassword();
    return bcrypt.compare(password, passwordHash);
  }

  async generateAccessToken(user = {}, secret = process.env.JWT_SECRET) {
    try {
      this.id = user.id || this.id;
      this.email = user.email || this.email;
      user = await this.find();

      if (!user) return;

      return jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        secret,
        {
          expiresIn: "1h",
          // issuer: process.env.AUTH0_DOMAIN,
          // audience: process.env.AUTH0_AUDIENCE,
          // algorithm: "HS256",
        }
      );
    } catch (err) {
      logger.error(err);
    }
  }

  async generateRefreshToken(
    user = {},
    secret = process.env.JWT_REFRESH_SECRET
  ) {
    try {
      this.id = user.id || this.id;
      user = await this.find();
      if (!user) return;

      return jwt.sign({ id: user.id }, secret, {
        expiresIn: "24h",
      });
    } catch (err) {
      logger.error(err);
    }
  }

  verifyToken(token, secret = process.env.JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      logger.error(err.message);
    }
  }

  async login() {
    try {
      const token = await this.generateAccessToken();
      const refresh = await this.generateRefreshToken();

      return { token, refresh };
    } catch (err) {
      logger.error(err);
    }
  }

  mail(type, user = {}, attr = {}) {
    try {
      const name = user.name || this.name;
      const email = user.email || this.email;
      const from = template[type].from;
      const subject = template[type].subject;

      mail.content({
        name,
        email,
        subject,
        from,
        ...attr,
      });
      return mail.send(template[type].template);
    } catch (err) {
      logger.error(err);
    }
  }

  async createResetToken(user = {}) {
    await this.#resetAllToken();

    const salt = await bcrypt.genSalt(10);
    const token = salt
      .substr(20)
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

    this.id = user.id || this.id;
    this.email = user.email || this.email;
    user = await this.find();

    if (user) {
      try {
        return prisma.reset.create({
          data: {
            token: token,
            expires: new Date(Date.now() + 600000),
            user: { connect: { id: user.id } },
          },
          select: {
            token: true,
          },
        });
      } catch (err) {
        logger.error(err);
      }
    }
    return null;
  }

  #resetAllToken() {
    return prisma.reset.updateMany({
      where: { user: { email: this.email }, expires: { lte: new Date() } },
      data: { expires: new Date() },
    });
  }

  async isValidResetToken() {
    const reset = await prisma.reset.findFirst({
      where: { token: this.resetToken },
      select: { id: true, user: { select: { id: true } } },
    });

    return !reset || reset.expires < new Date() ? false : reset;
  }

  updateProfile(data = {}) {
    return prisma.profile.upsert({
      where: { userId: this.id },
      update: { ...data },
      create: { ...data, user: { connect: { id: this.id } } },
      select: {
        firstname: true,
        lastname: true,
        bio: true,
      },
    });
  }

  async delete(user = {}) {
    try {
      this.id = user.id || this.id;
      this.email = user.email || this.email;

      user = await this.find();
      if (!user) return;

      return prisma.user.delete({
        where: {
          id: user.id,
        },
        select: this.selectedFields,
      });
    } catch (err) {
      logger.error(err);
    }
  }

  deleteMany(where = {}) {
    try {
      return prisma.user.deleteMany({ where });
    } catch (err) {
      logger.error(err);
    }
  }
}

const users = new User();
module.exports = { users, User };
