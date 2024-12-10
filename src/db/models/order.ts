'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { OrderAttributes } from '../../types/userTypes';

const Orders = sequelize.define<Model<OrderAttributes>>('orders', {
  id: {
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  orderId: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.STRING
  },
  productId: {
    allowNull: false,
    type: DataTypes.STRING
  },
  sellerId: {
    allowNull: false,
    type: DataTypes.STRING
  },
  usedQuantity: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  label: {
    allowNull: false,
    type: DataTypes.STRING
  },
  note: {
    allowNull: true,
    type: DataTypes.STRING
  },
  status: {
    allowNull: false,
    type: DataTypes.ENUM('pending', 'started', 'completed'),
  },
}, {
  modelName: 'orders',
  timestamps: true,
});

export default Orders;