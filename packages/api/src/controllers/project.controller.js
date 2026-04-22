const ProjectService = require('../services/project.service');
const ApiResponse = require('../utils/apiResponse.util');

class ProjectController {
  constructor(projectService = new ProjectService()) {
    this.projectService = projectService;
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async list(req, res, next) {
    try {
      const { items, total, page, limit } = await this.projectService.listProjects(req.query);
      res.status(200).json(ApiResponse.paginated(items, total, page, limit));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const project = await this.projectService.createProject(req.body, req.user);
      res.status(201).json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const project = await this.projectService.getProject(req.params.id);
      res.status(200).json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const project = await this.projectService.updateProject(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.projectService.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProjectController;
