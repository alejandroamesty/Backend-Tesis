import db from '../app/db.ts';
import { ForbiddenError, NotFoundError } from '../utils/errors/httpErrors.ts';

class EventsService {
	async getAll(user_id: string) {
		return await db.transaction().execute(async (trx) => {
			const userChats = await trx
				.selectFrom('chat_members')
				.where('user_id', '=', user_id)
				.select(['chat_id'])
				.execute();

			if (!userChats.length) {
				return [];
			}

			// Fetch communities linked to the user's chats
			const communityIds = await trx
				.selectFrom('communities')
				.where('chat_id', 'in', userChats.map((chat) => chat.chat_id))
				.select(['id'])
				.execute();

			if (!communityIds.length) {
				return [];
			}

			// Fetch events for these communities
			const events = await trx
				.selectFrom('events as e')
				.leftJoin('coordinates as c', 'e.event_location', 'c.id')
				.where('community_id', 'in', communityIds.map((community) => community.id))
				.select([
					'e.id',
					'e.name',
					'e.description',
					'e.event_date',
					'e.event_location',
					'e.cancelled',
					'c.x',
					'c.y',
				])
				.execute();

			return events;
		});
	}

	async getAllFromCommunity(community_id: string, user_id: string) {
		return await db.transaction().execute(async (trx) => {
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', community_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new NotFoundError(
					'La comunidad que buscas no existe',
				);
			}

			if (community.private_community) {
				const [member] = await trx
					.selectFrom('chat_members')
					.where('chat_id', '=', community.chat_id)
					.where('user_id', '=', user_id)
					.selectAll()
					.execute();

				if (!member) {
					throw new NotFoundError(
						'La comunidad que buscas no existe',
					);
				}
			}

			return await trx
				.selectFrom('events as e')
				.leftJoin('coordinates as c', 'e.event_location', 'c.id')
				.where('community_id', '=', community_id)
				.select([
					'e.id',
					'e.name',
					'e.description',
					'e.event_date',
					'e.event_location',
					'e.cancelled',
					'c.x',
					'c.y',
				])
				.execute();
		});
	}

	async createEvent(user_id: string, community_id: string, event: {
		name: string;
		description?: string;
		location: { x: number; y: number };
		date: Date;
	}) {
		return await db.transaction().execute(async (trx) => {
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', community_id)
				.where('owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError(
					'No tienes permisos para crear eventos en esta comunidad',
				);
			}

			const [existingLocation] = await trx
				.selectFrom('coordinates')
				.where('x', '=', event.location.x)
				.where('y', '=', event.location.y)
				.selectAll()
				.execute();

			let newLocation = null;

			if (!existingLocation) {
				[newLocation] = await trx
					.insertInto('coordinates')
					.values({ x: event.location.x, y: event.location.y })
					.returning('id')
					.execute();
			}

			const [eventCreated] = await trx
				.insertInto('events')
				.values({
					community_id: community_id,
					name: event.name,
					description: event.description ?? null,
					event_date: event.date,
					event_location: existingLocation?.id ?? newLocation?.id,
				})
				.returning('id')
				.execute();

			return eventCreated;
		});
	}

	cancelEvent(user_id: string, event_id: string) {
		return db.transaction().execute(async (trx) => {
			const [event] = await trx
				.selectFrom('events as e')
				.leftJoin('communities as c', 'e.community_id', 'c.id')
				.where('e.id', '=', event_id)
				.where('c.owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!event) {
				throw new ForbiddenError(
					'No tienes permisos para cancelar este evento',
				);
			}

			if (event.cancelled || new Date(event.event_date) < new Date()) {
				throw new ForbiddenError(
					'No puedes cancelar este evento porque ya ha pasado o ha sido cancelado',
				);
			}

			await trx
				.updateTable('events')
				.where('id', '=', event_id)
				.set('cancelled', true)
				.execute();
		});
	}

	updateEvent(user_id: string, event_id: string, event: {
		name?: string;
		description?: string;
		location?: { x: number; y: number };
		date?: Date;
	}) {
		return db.transaction().execute(async (trx) => {
			const [eventData] = await trx
				.selectFrom('events as e')
				.leftJoin('communities as c', 'e.community_id', 'c.id')
				.where('e.id', '=', event_id)
				.where('c.owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!eventData) {
				throw new ForbiddenError(
					'No tienes permisos para actualizar este evento',
				);
			}

			if (eventData.cancelled || new Date(eventData.event_date) < new Date()) {
				throw new ForbiddenError(
					'No puedes actualizar este evento porque ya ha pasado o ha sido cancelado',
				);
			}

			if (event.name || event.description || event.date) {
				await trx
					.updateTable('events')
					.where('id', '=', event_id)
					.set({
						name: event.name,
						description: event.description,
						event_date: event.date,
					})
					.execute();
			}

			if (event.location) {
				const [existingLocation] = await trx
					.selectFrom('coordinates')
					.where('x', '=', event.location.x)
					.where('y', '=', event.location.y)
					.selectAll()
					.execute();

				let newLocation = null;

				if (!existingLocation) {
					[newLocation] = await trx
						.insertInto('coordinates')
						.values({ x: event.location.x, y: event.location.y })
						.returning('id')
						.execute();
				}

				await trx
					.updateTable('events')
					.where('id', '=', event_id)
					.set('event_location', existingLocation?.id ?? newLocation?.id)
					.returningAll()
					.execute();
			}
		});
	}
}

export default new EventsService();
