import { Router } from 'express';
const router = Router();

import UserController from '../controllers/UserController.js';

// Middlewares
import validateUser from '../middlewares/validateUser.js';
import checkToken from '../middlewares/checkToken.js';
import checkAdmin from '../middlewares/checkAdmin.js';

/**
 * Public routes
 * These endpoints are accessible without an authentication token.
 */
router.post('/login', UserController.login);
router.post('/refresh', UserController.refresh);
router.get('/checkuser', UserController.checkUser); // Validates existing session on app load

/**
 * Registration route
 * Note: The controller handles the logic where the first user becomes Admin.
 * Subsequent registrations require an Admin token if the system is already initialized.
 */
router.post('/register', validateUser, UserController.register);

/**
 * Protected routes
 * Requires a valid JWT token.
 */
router.use(checkToken);

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/:id', validateUser, UserController.update);

/**
 * Administrative routes
 * Requires both a valid token and Admin privileges.
 */
router.use(checkAdmin);

// Restore a soft-deleted user - restricted to administrators
router.patch('/restore/:id', UserController.restore);

// Logical deletion (Soft Delete) - restricted to administrators
router.delete('/:id', UserController.delete);

export default router;
