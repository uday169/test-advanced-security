module.exports = ({ User, Project, Task }) => {
  User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });
  Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

  User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
};
