const AdminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse.util');

class AdminController {
  constructor(adminService = new AdminService()) {
    this.adminService = adminService;
    this.updateUser = this.updateUser.bind(this);
  }

  async updateUser(req, res, next) {
    try {
      const user = await this.adminService.updateUserById(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
