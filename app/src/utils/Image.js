const prisma = require("../functions/prisma");

class Image {
  constructor(image = {}) {
    this.id = image.id || null;
    this.url = image.url || null;
    this.selectedFields = {
      id: true,
      url: true,
    };
  }

  async save(image = {}) {
    this.id = image.id || this.id;
    this.url = image.url || this.url;

    return this.id ? this.update() : this.create();
  }

  async create(url = this.url) {
    const image = await prisma.image.create({
      data: { url },
      select: this.selectedFields,
    });

    this.id = image.id;
    return image;
  }

  update(image = {}) {
    const id = image.id || this.id;
    const url = image.url || this.url;

    return prisma.image.update({
      where: {
        id,
      },
      data: {
        url,
      },
      select: this.selectedFields,
    });
  }

  find(image = {}) {
    const id = image.id || this.id;

    return prisma.image.findFirst({
      where: { id },
      select: this.selectedFields,
    });
  }

  async delete(image = {}) {
    this.id = image.id || this.id;

    image = await this.find();

    if (image)
      return prisma.image.delete({
        where: { id: this.id },
      });

    return null;
  }

  deleteMany(where = {}) {
    return prisma.deleteMany({
      where,
    });
  }
}

const image = new Image();
module.exports = { image, Image };
