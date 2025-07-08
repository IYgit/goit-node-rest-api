
import sequelize from '../db/sequelize.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  subscription: {
    type: DataTypes.ENUM,
    values: ['starter', 'pro', 'business'],
    defaultValue: 'starter',
  },
  token: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  avatarURL: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    defaultValue: null,
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.associate = function(models) {
  User.hasMany(models.Contact, {
    foreignKey: 'owner',
    as: 'contacts',
  });
};

// await sequelize.sync({ alter: true });

export default User;