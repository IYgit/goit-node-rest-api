import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Contact = sequelize.define('contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false // відключаємо автоматичне управління timestamps
});

export default Contact;