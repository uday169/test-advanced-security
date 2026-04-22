const { hashPassword } = require('../../utils/password.util');
const { User, Project, Task, sequelize } = require('../../models');

async function seed() {
  await sequelize.sync({ force: true });

  const users = await Promise.all(
    [
      { name: 'Alice Admin', email: 'alice@taskflow.dev', role: 'admin', password: 'Admin1234!' },
      { name: 'Marcus Mgr', email: 'marcus@taskflow.dev', role: 'manager', password: 'Manager99#' },
      { name: 'Eva Employee', email: 'eva@taskflow.dev', role: 'employee', password: 'Employee55$' },
      { name: 'Dev Tester', email: 'dev@taskflow.dev', role: 'employee', password: 'Tester00@' },
    ].map(async ({ password, ...user }) => {
      const passwordHash = await hashPassword(password);
      return User.create({ ...user, passwordHash });
    })
  );

  const byEmail = Object.fromEntries(users.map((user) => [user.email, user]));
  const ownerId = byEmail['marcus@taskflow.dev'].id;

  const projects = await Project.bulkCreate(
    [
      { name: 'Website Redesign', status: 'active', ownerId },
      { name: 'API Migration', status: 'active', ownerId },
    ],
    { returning: true }
  );

  const projectByName = Object.fromEntries(projects.map((project) => [project.name, project]));
  const evaId = byEmail['eva@taskflow.dev'].id;
  const devId = byEmail['dev@taskflow.dev'].id;

  await Task.bulkCreate([
    { title: 'Update landing page mockups', status: 'todo', priority: 'high', assigneeId: evaId, projectId: projectByName['Website Redesign'].id },
    { title: 'Create migration checklist', status: 'todo', priority: 'medium', assigneeId: devId, projectId: projectByName['API Migration'].id },
  ]);

  await sequelize.close();
}

seed();
