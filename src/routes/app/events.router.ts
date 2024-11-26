import { Router } from 'express';
import eventsController from '../../controllers/events.controller.ts';

const eventsRouter = Router();

eventsRouter.get('/:id', eventsController.getAll);

export default eventsRouter;
