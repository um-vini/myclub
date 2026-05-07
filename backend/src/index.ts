import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import conn from './db/conn.js';

import dotenv from 'dotenv';

dotenv.config();

// Models
import Plan from './models/Plan.js';
import Member from './models/Member.js';
import User from './models/User.js';
import Payment from './models/Payment.js';
import RefreshToken from './models/RefreshToken.js';
import Expense from './models/Expense.js';

// Import Routes
import memberRoutes from './routes/MemberRoutes.js';
import planRoutes from './routes/PlanRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import paymentRoutes from './routes/PaymentRoutes.js';
import statsRoutes from './routes/StatsRoutes.js';
import expenseRoutes from './routes/ExpenseRoutes.js';

const app = express();

/**
 * Global Middlewares
 */
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Database Associations
 */
// Plan <-> Member (One-to-Many)
Plan.hasMany(Member, { foreignKey: 'planId', as: 'members' });
Member.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// Member <-> Payment (One-to-Many)
Member.hasMany(Payment, { foreignKey: 'memberId', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// User <-> RefreshToken (One-to-Many)
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
  onDelete: 'CASCADE',
});
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Expense self-association
Expense.hasMany(Expense, { foreignKey: 'parentId', as: 'installments' });

/**
 * Routes
 */
app.use('/members', memberRoutes);
app.use('/plans', planRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);
app.use('/stats', statsRoutes);
app.use('/expenses', expenseRoutes);

/**
 * Database Connection and Server Initialization
 */
conn
  .sync()
  .then(() => {
    const PORT = Number(process.env.PORT) || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);

      if (process.env.NODE_ENV !== 'production') {
        console.log(`🏠 Local network access: http://localhost:${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });
