'use strict';
import { DataTypes, Model } from 'sequelize';
import sequelize from '../dbConnect';
import { ProductAttributes } from '../../types/userTypes';

const Products = sequelize.define<Model<ProductAttributes>>('products', {
  id: {
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  productId: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  sellerId: {
    allowNull: false,
    type: DataTypes.STRING
  },
  totalQuantity: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  availableQuantity: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
}, {
  modelName: 'products',
  timestamps: true,
});

export default Products;