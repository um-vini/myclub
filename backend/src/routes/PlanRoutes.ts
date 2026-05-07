import { Router } from 'express';
const router = Router();

import PlanController from '../controllers/PlanController.js';

// Middlewares
import validatePlan from '../middlewares/ValidatePlan.js';
import checkToken from '../middlewares/checkToken.js';
import checkAdmin from '../middlewares/checkAdmin.js';

/**
 * Routes for membership plan management.
 * All operations require a valid authentication token.
 */
router.use(checkToken);

// Retrieve all available plans
router.get('/', PlanController.getAll);

// Register a new plan - restricted to administrators
router.post('/register', checkAdmin, validatePlan, PlanController.register);

// Status management (Activation/Inactivation) - restricted to administrators
router.patch('/inactivate/:id', checkAdmin, PlanController.inactivate);
router.patch('/reactivate/:id', checkAdmin, PlanController.reactivate);

// Restore a soft-deleted plan - restricted to administrators
router.patch('/restore/:id', checkAdmin, PlanController.restore);

// Update existing plan details - restricted to administrators
router.put('/:id', checkAdmin, validatePlan, PlanController.update);

// Retrieve specific plan by ID
router.get('/:id', PlanController.getById);

// Logical deletion (Soft Delete) - restricted to administrators
router.delete('/:id', checkAdmin, PlanController.delete);

export default router;
