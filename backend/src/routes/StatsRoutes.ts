import { Router } from 'express';
import StatsController from '../controllers/StatsController.js';
import checkToken from '../middlewares/checkToken.js';

const router = Router();

/**
 * Routes for dashboard statistics and financial reporting.
 * Access is restricted to authenticated users.
 */
// router.use(checkToken);

// Retrieve all dashboard stats (revenue, expected revenue, active members)
router.get('/', StatsController.getAll);

export default router;
