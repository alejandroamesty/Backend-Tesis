import eventsService from '../services/events.service.ts';
import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.ts';
import { verifyTypes } from '../utils/typeChecker.ts';
import { BadRequestError } from '../utils/errors/httpErrors.ts';

class EventsController {
	async getAll(req: Request, res: Response) {
		try {
			const id = Number(req.params.id);
			const user_id = Number(req.user);
			verifyTypes({ value: [id, user_id], type: 'number' });

			const events = await eventsService.getAll(id, user_id);

			// check which events are in the past and add a boolean to the response

			const now = new Date();
			const newEvents = events.map((event) => {
				const eventDate = new Date(event.event_date);
				return {
					id: event.id,
					name: event.name,
					description: event.description,
					event_date: eventDate,
					event_location: {
						x: event.x,
						y: event.y,
					},
					is_past: eventDate < now,
					cancelled: event.cancelled,
				};
			});

			res.json({
				msg: 'Eventos encontrados con éxito',
				data: newEvents,
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
				{
					value: [event_location?.x, event_location?.y, community_id, user_id],
					type: 'number',
				},
			]);

			const now = new Date();
			const eventDate = new Date(event_date);
			if (eventDate < now) {
				throw new BadRequestError('La fecha del evento debe ser en el futuro');
			}

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

	async cancelEvent(req: Request, res: Response) {
		try {
			const user_id = Number(req.user);
			const event_id = Number(req.params.id);

			verifyTypes({ value: [user_id, event_id], type: 'number' });

			await eventsService.cancelEvent(user_id, event_id);
			res.json({
				msg: 'Evento cancelado con éxito',
			});
		} catch (error) {
			handleError(error, res);
		}
	}

	async updateEvent(req: Request, res: Response) {
		try {
			const user_id = Number(req.user);
			const event_id = Number(req.params.id);
			const { name, description, event_date, event_location } = req.body;

			verifyTypes([
				{ value: [name, description, event_date], type: 'string', optional: true },
				{ value: [user_id, event_id], type: 'number' },
				{ value: [event_location?.x, event_location?.y], type: 'number', optional: true },
			]);

			const now = new Date();
			const eventDate = new Date(event_date);
			if (eventDate < now) {
				throw new BadRequestError('La fecha del evento debe ser en el futuro');
			}

			const event = await eventsService.updateEvent(user_id, event_id, {
				name,
				description,
				date: event_date,
				location: event_location,
			});

			res.json({
				msg: 'Evento actualizado con éxito',
				data: event,
			});
		} catch (error) {
			handleError(error, res);
		}
	}
}

export default new EventsController();
