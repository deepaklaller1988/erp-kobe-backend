import Users from "./user";
import Products from "./product";
import Orders from "./order";
import SellerShippers from "./seller-shipper";

Orders.hasMany(Products, { foreignKey: 'productId', sourceKey: "productId" });
Products.belongsTo(Orders, { foreignKey: 'productId' });

// SellerShippers.hasMany(Users, { foreignKey: 'sellerId', sourceKey: "sellerId" });
// Users.belongsTo(SellerShippers, { foreignKey: 'sellerId' });

// SellerShippers.hasMany(Users, { foreignKey: 'shipperId', sourceKey: "shipperId" });
// Users.belongsTo(SellerShippers, { foreignKey: 'shipperId' });

export { Users, Products, Orders, SellerShippers }