import { Router } from 'express';
import eventsController from '../../controllers/events.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const eventsRouter = Router();

eventsRouter
	.get('/:id', userAuth, eventsController.getAll)
	.post('/:id', userAuth, eventsController.createEvent)
	.put('/:id', userAuth, eventsController.updateEvent)
	.delete('/:id', userAuth, eventsController.cancelEvent);

export default eventsRouter;
