import eventsService from '../services/events.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';

class EventsController {
	async getAll(req: Request, res: Response) {
		try {
			const id = Number(req.params.id);
			verifyTypes({ value: id, type: 'number' });

			const events = await eventsService.getAll(id);
			res.json({
				msg: 'Eventos encontrados con éxito',
				data: events,
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async createEvent(req: Request, res: Response) {
		try {
			const user_id = Number(req.user);
			const community_id = Number(req.params.id);

			const { name, description, event_date, event_location } = req.body;

			verifyTypes([
				{ value: [name, description, event_date], type: 'string' },
				{ value: [event_location?.x, event_location?.y, community_id], type: 'number' },
			]);

			const newEvent = await eventsService.createEvent(user_id, community_id, {
				name,
				description,
				date: event_date,
				location: event_location,
			});
			res.json({
				msg: 'Evento creado con éxito',
				data: newEvent,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new EventsController();
