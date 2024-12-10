import dotenv from 'dotenv';
dotenv.config({ path: `.env` });

const options = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres'
};

export const development = options;
export const local = options;
export const production = options;

export default {
    local,
    development,
    production,
};