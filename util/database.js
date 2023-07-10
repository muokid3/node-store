const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_store', 'root', 'st34lthfr34k', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
