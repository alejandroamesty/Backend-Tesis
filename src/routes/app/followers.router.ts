import { Router } from 'express';
import followerController from '../../controllers/follower.controller.ts';
import { userAuth } from '../../middlewares/userAuth.ts';

const followerRouter = Router();

followerRouter
	.get('/:userId', followerController.getUserFollowers)
	.get('/following/:userId', followerController.getUserFollowing)
	.post('/follow', userAuth, followerController.followUser)
	.delete('/unfollow', userAuth, followerController.unfollowUser);

export default followerRouter;
