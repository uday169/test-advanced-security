const ProjectRepository = require('../repositories/project.repository');
const { getPagination } = require('../utils/pagination.util');

class ProjectService {
  constructor(projectRepository = new ProjectRepository()) {
    this.projectRepository = projectRepository;
  }

  async listProjects(query) {
    const { page, limit, offset } = getPagination(query);
    const [items, total] = await Promise.all([
      this.projectRepository.findAllWithTasks({ limit, offset }),
      this.projectRepository.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async createProject(data, user) {
    return this.projectRepository.create({
      ...data,
      ownerId: data.ownerId || user.id,
      status: data.status || 'active',
    });
  }

  async getProject(id) {
    const project = await this.projectRepository.findByIdWithTasks(id);
    if (!project) {
      const error = new Error('Project not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return project;
  }

  async updateProject(id, data) {
    const project = await this.projectRepository.update(id, data);
    if (!project) {
      const error = new Error('Project not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return project;
  }

  async deleteProject(id) {
    const deleted = await this.projectRepository.delete(id);
    if (!deleted) {
      const error = new Error('Project not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
  }
}

module.exports = ProjectService;
