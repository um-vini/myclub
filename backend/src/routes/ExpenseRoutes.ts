import { Router } from 'express';
const router = Router();

import ExpenseController from '../controllers/ExpenseController.js';

// Middlewares
import checkToken from '../middlewares/checkToken.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import validateExpense from '../middlewares/ValidateExpense.js';

/**
 * Routes for accounts payable and operational expenses management.
 * All routes require authentication.
 */
router.use(checkToken);

// Retrieve all expense records
router.get('/', ExpenseController.getAll);

// Filter expenses by category, status, month, or year
router.get('/search', ExpenseController.getByFilters);

// Register a new expense (single, recurring, or installments)
router.post('/register', validateExpense, ExpenseController.register);

// Record payment for an existing expense
router.patch('/pay/:id', ExpenseController.pay);

// Update existing expense details
router.put('/:id', validateExpense, ExpenseController.update);

// Logical deletion (Soft Delete) - restricted to administrators
router.delete('/:id', checkAdmin, ExpenseController.delete);

export default router;
