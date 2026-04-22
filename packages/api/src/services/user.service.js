const UserRepository = require('../repositories/user.repository');

class UserService {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  listUsers() {
    return this.userRepository.findAllSafe();
  }
}

module.exports = UserService;
