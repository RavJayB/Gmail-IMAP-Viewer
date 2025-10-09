const sequelize = require('../config/database');
const User = require('./User');
const Email = require('./Email');

// Define associations
User.hasMany(Email, { foreignKey: 'userId', as: 'emails' });
Email.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Email,
  syncDatabase
};
