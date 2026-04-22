const BaseRepository = require('./base.repository');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email) {
    return this.findOne({ email });
  }

  findAllSafe() {
    return this.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = UserRepository;
