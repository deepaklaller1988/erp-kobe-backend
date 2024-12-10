'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { UserAttributes } from '../../types/userTypes';

const Users = sequelize.define<Model<UserAttributes>>('users', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true
  },
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('seller', 'shipper'),
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      is: {
        args: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        msg: 'Invalid email address format'
      }
    }
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  verified: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
  }
}, {
  modelName: 'users',
  timestamps: true,
});

export default Users;