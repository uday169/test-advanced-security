const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse.util');

class AuthController {
  constructor(authService = new AuthService()) {
    this.authService = authService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(req, res, next) {
    try {
      const data = await this.authService.register(req.body);
      res.status(201).json(ApiResponse.success(data));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await this.authService.login(req.body);
      res.status(200).json(ApiResponse.success(data));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
