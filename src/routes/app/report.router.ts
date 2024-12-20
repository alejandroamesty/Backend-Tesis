import { Router } from 'express';
import reportsController from '../../controllers/reports.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const reportRouter = Router();

reportRouter.get('/', userAuth, reportsController.getReports)
	.get('/:id', userAuth, reportsController.getReport)
	.post('/', userAuth, reportsController.createReport)
	.delete('/:id', userAuth, reportsController.deleteReport);

export default reportRouter;
