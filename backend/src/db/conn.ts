import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sequelize instance configuration for MySQL connection.
 * Connects to the 'clubFuncional' database using local credentials.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'clubFuncional',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // ssl: { rejectUnauthorized: false }
    },
  },
);

/**
 * Asynchronous function to verify the database connection status.
 */
const testConnection = async () => {
  try {
    // Attempt to authenticate the connection
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL safely.');
  } catch (error) {
    // Enhanced error logging for connection issues
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown connection error';
    console.error('Database connection error:', errorMessage);

    // Db credentials error
    if ((error as any).code === 'ER_BAD_DB_ERROR') {
      console.error('Verifique se o banco foi criado.');
    }
  }
};

// Execute the connection test
testConnection();

export default sequelize;
