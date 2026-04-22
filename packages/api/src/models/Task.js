module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'done'),
        allowNull: false,
        defaultValue: 'todo',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      assigneeId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    { timestamps: true }
  );
};
