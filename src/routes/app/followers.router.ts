import { Router } from 'express';
import followerController from '../../controllers/follower.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const followerRouter = Router();

followerRouter
	.get('/:userId', followerController.getUserFollowers)
	.post('/follow', userAuth, followerController.followUser)
	.delete('/unfollow', userAuth, followerController.unfollowUser);

export default followerRouter;
