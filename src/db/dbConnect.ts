import { Sequelize } from 'sequelize';
import { local } from './config/config';

const dbOptions: any = local;

const sequelize = new Sequelize(dbOptions);

export default sequelize;