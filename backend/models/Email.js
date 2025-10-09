const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  flags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  htmlBody: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  folder: {
    type: DataTypes.STRING,
    defaultValue: 'INBOX'
  }
}, {
  tableName: 'emails',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['messageId']
    },
    {
      fields: ['userId', 'date']
    },
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['from']
    },
    {
      fields: ['subject']
    },
    {
      fields: ['date']
    }
  ]
});

module.exports = Email;
