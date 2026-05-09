import { Router } from 'express';
const router = Router();

import MemberController from '../controllers/MemberController.js';

// Middlewares
import validateMember from '../middlewares/validateMember.js';
import checkToken from '../middlewares/checkToken.js';
import checkAdmin from '../middlewares/checkAdmin.js';

/**
 * Routes for member management.
 * All routes in this module require a valid authentication token.
 */
router.use(checkToken);

// Retrieve all members
router.get('/', MemberController.getAll);

// Register a new member with data validation
router.post('/register', checkAdmin, validateMember, MemberController.register);

// Status management (Activation/Inactivation)
router.patch('/inactivate/:id', checkAdmin, MemberController.inactivate);
router.patch('/reactivate/:id', checkAdmin, MemberController.reactivate);

// Restore a soft-deleted member - restricted to administrators
router.patch('/restore/:id', checkAdmin, MemberController.restore);

// Update existing member details
router.put('/:id', checkAdmin, validateMember, MemberController.update);

// Retrieve specific member by ID
router.get('/:id', MemberController.getById);

// Logical deletion (Soft Delete) - restricted to administrators
router.delete('/:id', checkAdmin, MemberController.delete);

export default router;
