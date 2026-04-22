class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findOne(where) {
    return this.model.findOne({ where });
  }

  create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const entity = await this.findById(id);
    if (!entity) return null;
    await entity.update(data);
    return entity;
  }

  delete(id) {
    return this.model.destroy({ where: { id } });
  }

  count(where = {}) {
    return this.model.count({ where });
  }
}

module.exports = BaseRepository;
