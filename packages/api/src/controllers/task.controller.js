const TaskService = require('../services/task.service');
const ApiResponse = require('../utils/apiResponse.util');

class TaskController {
  constructor(taskService = new TaskService()) {
    this.taskService = taskService;
    this.debug = this.debug.bind(this);
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async debug(req, res, next) {
    try {
      const result = this.taskService.runDebugEval(req.query.expr);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const tasks = await this.taskService.listTasks(req.query);
      res.status(200).json(ApiResponse.success(tasks));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const task = await this.taskService.createTask(req.body);
      res.status(201).json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const task = await this.taskService.getTask(req.params.id);
      res.status(200).json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(task));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.taskService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
