const BaseRepository = require('./base.repository');
const { Task, User } = require('../models');

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  findByProject(projectId, filters = {}) {
    const where = { ...filters };
    if (projectId) {
      where.projectId = projectId;
    }

    return this.findAll({
      where,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  findByIdWithAssignee(id) {
    return this.findById(id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'role'] }],
    });
  }
}

module.exports = TaskRepository;
