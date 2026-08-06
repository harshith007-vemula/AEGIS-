import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Incident Management
router.post('/', authMiddleware, IncidentController.create);
router.get('/', authMiddleware, IncidentController.list);
router.get('/reports', authMiddleware, IncidentController.getReports);
router.get('/:id', authMiddleware, IncidentController.getById);

// Agent Swarming Execution
router.post('/:id/orchestrate', authMiddleware, IncidentController.runOrchestrator);

// Report Retrievals
router.get('/:incidentId/report', authMiddleware, IncidentController.getReport);
router.get('/pdf/:incidentId', IncidentController.downloadReportPdf); // Public download link

export default router;
