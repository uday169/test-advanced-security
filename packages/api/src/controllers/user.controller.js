const UserService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse.util');

class UserController {
  constructor(userService = new UserService()) {
    this.userService = userService;
    this.list = this.list.bind(this);
  }

  async list(req, res, next) {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json(ApiResponse.success(users));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
