import db from '../app/db.ts';
import { NotFoundError } from '../utils/errors/httpErrors.ts';

class ActivitiesService {
	async getActivities(user_id: string) {
		return await db
			.selectFrom('activities')
			.where('user_id', '=', user_id)
			//check for activities in the last year
			.where(
				'registered_at',
				'>',
				new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
			)
			.selectAll()
			.execute();
	}

	async insertActivity(user_id: string, activity_description: string) {
		return await db
			.insertInto('activities')
			.values({
				user_id: user_id,
				activity_description: activity_description,
			}).returningAll()
			.execute();
	}

	async updateActivity(user_id: string, activity_id: string, completed: boolean) {
		let date = null;
		if (completed === true) {
			date = new Date();
		}
		const result = await db
			.updateTable('activities')
			.set({ completed: completed, completed_at: date })
			.where('user_id', '=', user_id)
			.where('id', '=', activity_id)
			.returningAll()
			.executeTakeFirst();
		if (!result) {
			throw new NotFoundError('Actividad no encontrada');
		}
		return result;
	}
}

export default new ActivitiesService();
