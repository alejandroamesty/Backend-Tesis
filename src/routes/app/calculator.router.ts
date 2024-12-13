import { Router } from 'express';
import carbonFootprintController from '../../controllers/carbonFootprint.controller.ts';

const carbonFootprintRouter = Router();

carbonFootprintRouter.post('/calculate', carbonFootprintController.getCarbonFootprint);

export default carbonFootprintRouter;
