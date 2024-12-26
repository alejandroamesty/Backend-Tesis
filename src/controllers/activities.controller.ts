import ActivitiesService from '../services/activities.service.ts';
import { Request, Response } from 'express';
import { verifyTypes } from '../utils/typeChecker.ts';
import { handleError } from '../utils/errorHandler.ts';

class ActivitiesController {
	async getActivities(req: Request, res: Response) {
		try {
			const activities = await ActivitiesService.getActivities(req.user);
			res.status(200).json({ msg: 'Actividades encontradas con exito', data: activities });
		} catch (error) {
			handleError(error, res);
		}
	}

	async insertActivity(req: Request, res: Response) {
		try {
			const user_id = req.user;
			const activity_description = req.body.activity_description;

			verifyTypes([
				{ value: user_id, type: 'uuid' },
				{ value: activity_description, type: 'string' },
			]);
			const activity = await ActivitiesService.insertActivity(
				req.user,
				req.body.activity_description,
			);
			res.status(201).json({ msg: 'Actividad creada con exito', data: activity });
		} catch (error) {
			handleError(error, res);
		}
	}

	async updateActivity(req: Request, res: Response) {
		try {
			const user_id = req.body.user_id || req.user;
			const activity_id = req.params.activity_id;
			const completed = req.body.completed;

			verifyTypes([
				{ value: user_id, type: 'uuid' },
				{ value: activity_id, type: 'uuid' },
				{ value: completed, type: 'boolean' },
			]);
			const activity = await ActivitiesService.updateActivity(
				user_id,
				activity_id,
				completed,
			);
			res.status(200).json({ msg: 'Actividad actualizada con exito', data: activity });
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new ActivitiesController();
