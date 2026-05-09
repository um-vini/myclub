import { Router } from 'express';
const router = Router();

import PaymentController from '../controllers/PaymentController.js';

// Middlewares
import validatePayment from '../middlewares/validatePayment.js';
import checkToken from '../middlewares/checkToken.js';
import checkAdmin from '../middlewares/checkAdmin.js';

// TODO: check authorizations
/**
 * Routes for financial management and payment tracking.
 * All routes require authentication.
 */
router.use(checkToken);

// Retrieve all payment records
router.get('/', PaymentController.getAll);

// Filter payments by member, month, or year
router.get('/search', PaymentController.getByFilters);

// Register a new payment with data validation
router.post('/register', validatePayment, PaymentController.register);

// Restore a soft-deleted payment record - restricted to administrators
router.patch('/restore/:id', checkAdmin, PaymentController.restore);

// Cancel a payment changing status to cancelled
router.patch('/cancel/:id', PaymentController.cancel);

// Update existing payment details
router.put('/:id', checkAdmin, validatePayment, PaymentController.update);

// Logical deletion (Soft Delete) - restricted to administrators
router.delete('/:id', checkAdmin, PaymentController.delete);

export default router;
