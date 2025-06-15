import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Завантажуємо відповідний .env файл
const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });

const sequelize = new Sequelize({
    dialect: process.env.DATABASE_DIALECT,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    dialectOptions: { 
        ssl: true,
        rejectUnauthorized: false
    }
});

try {
    await sequelize.authenticate();
    console.log("Database connection successful");
    await sequelize.sync(); // This will create the tables if they don't exist
} catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
}

export default sequelize;