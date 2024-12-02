import searchController from '../../controllers/search.controller.ts';
import Router from 'express';

const searchRouter = Router();

searchRouter.get('/', searchController.search);

export default searchRouter;
