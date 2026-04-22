const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Project = require('./Project')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);

require('./associations')({ User, Project, Task });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
};
