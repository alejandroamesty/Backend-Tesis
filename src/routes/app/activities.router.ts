import activitiesController from '../../controllers/activities.controller.ts';
import { Router } from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';

const activitiesRouter = Router();

activitiesRouter
	.get('/', userAuth, activitiesController.getActivities)
	.post('/', userAuth, activitiesController.insertActivity)
	.put('/:activity_id', userAuth, activitiesController.updateActivity);

export default activitiesRouter;
