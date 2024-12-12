import Users from "./user";
import Products from "./product";
import Orders from "./order";
import SellerShippers from "./seller-shipper";

Orders.hasMany(Products, { foreignKey: 'productId', sourceKey: "productId" });
Products.belongsTo(Orders, { foreignKey: 'productId' });

export { Users, Products, Orders, SellerShippers }