import { Router } from 'express';
import communitiesController from '../../controllers/communities.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const communitiesRouter = Router();

communitiesRouter
	.get('/', userAuth, communitiesController.getAll)
	.get('/:id', userAuth, communitiesController.getById)
	.post('/', userAuth, communitiesController.create)
	.delete('/:id', userAuth, communitiesController.delete)
	.put('/:id', userAuth, communitiesController.update)
	.post('/:community_id/add', userAuth, communitiesController.addMember)
	.delete('/:community_id/remove', userAuth, communitiesController.removeMember);

export default communitiesRouter;
