import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Contact = sequelize.define('contact', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // видаляємо unique: true звідси
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  owner: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Name of the target table
      key: 'id',      // Name of the target column
    },
  },
}, {
  timestamps: false // відключаємо автоматичне управління timestamps
});

Contact.associate = function(models) {
  Contact.belongsTo(models.User, {
    foreignKey: 'owner',
    as: 'user',
  });
};

await sequelize.sync({ alter: true });

export default Contact;