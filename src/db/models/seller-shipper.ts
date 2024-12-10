'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { SellerShipperAttributes } from '../../types/userTypes';

const SellerShipper = sequelize.define<Model<SellerShipperAttributes>>('seller-shippers', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  sellerId: {
    allowNull: false,
    type: DataTypes.STRING
  },
  shipperId: {
    allowNull: false,
    type: DataTypes.STRING
  },
}, {
  modelName: 'seller-shippers',
  timestamps: true,
});

export default SellerShipper;