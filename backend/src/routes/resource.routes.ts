import { Router } from 'express';
import { ResourceController } from '../controllers/resource.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, ResourceController.getResources);
router.get('/hospitals', authMiddleware, ResourceController.getHospitals);
router.get('/vehicles', authMiddleware, ResourceController.getVehicles);
router.get('/logs', authMiddleware, ResourceController.getLogs);
router.get('/stats', authMiddleware, ResourceController.getDashboardStats);

// Alerts/Notifications
router.get('/notifications', authMiddleware, ResourceController.getNotifications);
router.post('/notifications/:id/read', authMiddleware, ResourceController.markNotificationRead);

export default router;
