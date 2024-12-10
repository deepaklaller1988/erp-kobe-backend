export interface UserAttributes {
    id?: number;
    userId: string;
    type: string;
    name: string;
    email: string;
    password: string;
    verified: boolean;
}

export interface SellerShipperAttributes {
    id?: number;
    sellerId: string;
    shipperId: string;
}

export interface ProductAttributes {
    id?: number;
    productId: string;
    name: string;
    sellerId: string;
    totalQuantity: number;
    availableQuantity: number;
}

export interface OrderAttributes {
    id?: number;
    orderId: string;
    productId: string;
    sellerId: string;
    usedQuantity: number;
    label: string;
    note: string;
    status: string;
}