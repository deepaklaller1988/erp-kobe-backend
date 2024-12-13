'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { SellerShipperAttributes } from '../../types/userTypes';

const SellerShippers = sequelize.define<Model<SellerShipperAttributes>>('seller-shippers', {
  id: {
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  sellerId: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING
  },
  shipperId: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING
  },
}, {
  modelName: 'seller-shippers',
  timestamps: true,
});

export default SellerShippers;