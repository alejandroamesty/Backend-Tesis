import { Router } from 'express';
import { userAuth } from '../../middlewares/userAuth.ts';
import carbonFootprintController from '../../controllers/carbonFootprint.controller.ts';

const carbonFootprintRouter = Router();

carbonFootprintRouter.post('/calculate', userAuth, carbonFootprintController.getCarbonFootprint);

export default carbonFootprintRouter;
