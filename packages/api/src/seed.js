const bcrypt = require('bcrypt');
const sequelize = require('./db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

async function seed() {
  await sequelize.sync({ force: true });

  const userSeeds = [
    { name: 'Alice Admin', email: 'alice@taskflow.dev', role: 'admin', password: 'Admin1234!' },
    { name: 'Marcus Mgr', email: 'marcus@taskflow.dev', role: 'manager', password: 'Manager99#' },
    { name: 'Eva Employee', email: 'eva@taskflow.dev', role: 'employee', password: 'Employee55$' },
    { name: 'Dev Tester', email: 'dev@taskflow.dev', role: 'employee', password: 'Tester00@' },
  ];

  const users = await Promise.all(
    userSeeds.map(async ({ password, ...user }) => {
      const passwordHash = await bcrypt.hash(password, 10);
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

  const tasks = await Task.bulkCreate(
    [
      {
        title: 'Update landing page mockups',
        status: 'todo',
        priority: 'high',
        assigneeId: evaId,
        projectId: projectByName['Website Redesign'].id,
      },
      {
        title: 'Create migration checklist',
        status: 'todo',
        priority: 'medium',
        assigneeId: devId,
        projectId: projectByName['API Migration'].id,
      },
      {
        title: 'Implement responsive header',
        status: 'in_progress',
        priority: 'high',
        assigneeId: devId,
        projectId: projectByName['Website Redesign'].id,
      },
      {
        title: 'Migrate auth endpoints',
        status: 'in_progress',
        priority: 'high',
        assigneeId: evaId,
        projectId: projectByName['API Migration'].id,
      },
      {
        title: 'Archive outdated assets',
        status: 'done',
        priority: 'low',
        assigneeId: evaId,
        projectId: projectByName['Website Redesign'].id,
      },
      {
        title: 'Backfill API regression tests',
        status: 'done',
        priority: 'medium',
        assigneeId: devId,
        projectId: projectByName['API Migration'].id,
      },
    ],
    { returning: true }
  );

  console.log('Seed complete');
  console.log('Users:', users.map((user) => user.id));
  console.log('Projects:', projects.map((project) => project.id));
  console.log('Tasks:', tasks.map((task) => task.id));
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
