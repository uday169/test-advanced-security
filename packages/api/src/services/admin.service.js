const UserRepository = require('../repositories/user.repository');

class AdminService {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async updateUserById(id, data) {
    const user = await this.userRepository.update(id, data);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return user;
  }
}

module.exports = AdminService;
