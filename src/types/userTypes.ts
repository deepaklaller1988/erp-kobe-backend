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
    id: number;
    sellerId: string;
    shipperId: string;
}