const BaseRepository = require('./base.repository');
const { Project, Task } = require('../models');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  findAllWithTasks({ limit, offset }) {
    return this.findAll({
      include: [{ model: Task, as: 'tasks', attributes: ['id'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  findByIdWithTasks(id) {
    return this.findById(id, {
      include: [{ model: Task, as: 'tasks' }],
    });
  }
}

module.exports = ProjectRepository;
