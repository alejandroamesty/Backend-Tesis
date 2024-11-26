import db from '../app/db.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';

class EventsService {
	async getAll(community_id: number) {
		// transaction: get community -> check if community is private -> check if member if not -> get events

		return await db.transaction().execute(async (trx) => {
			// Check if the user is a member of the community
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', community_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError(
					'No tienes permisos para ver los eventos de esta comunidad',
				);
			}

			if (community.private_community) {
				// Check if the user is a member of the community
				const [member] = await trx
					.selectFrom('chat_members')
					.where('chat_id', '=', community.chat_id)
					.where('user_id', '=', community.owner_id)
					.selectAll()
					.execute();

				if (!member) {
					throw new ForbiddenError(
						'No tienes permisos para ver los eventos de esta comunidad',
					);
				}
			}

			// Get the events
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
					'c.x',
					'c.y',
				])
				.execute();
		});

		// return await db
		// 	.selectFrom('events as e')
		// 	.leftJoin('coordinates as c', 'e.event_location', 'c.id')
		// 	.where('community_id', '=', community_id)
		// 	.select([
		// 		'e.id',
		// 		'e.name',
		// 		'e.description',
		// 		'e.event_date',
		// 		'e.event_location',
		// 		'c.x',
		// 		'c.y',
		// 	])
		// 	.execute();
	}

	async createEvent(user_id: number, community_id: number, event: {
		name: string;
		description?: string;
		location: { x: number; y: number };
		date: Date;
	}) {
		return await db.transaction().execute(async (trx) => {
			// Check if the user is a member of the community
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

			// Find if the location already exists
			const [location] = await trx
				.selectFrom('coordinates')
				.where('x', '=', event.location.x)
				.where('y', '=', event.location.y)
				.selectAll()
				.execute();

			// Create the location if it doesn't exist
			let eventLocation;

			if (!location) {
				[eventLocation] = await trx
					.insertInto('coordinates')
					.values({ x: event.location.x, y: event.location.y })
					.returning('id')
					.execute();
			}

			// Create the event

			const [eventCreated] = await trx
				.insertInto('events')
				.values({
					community_id: community_id,
					name: event.name,
					description: event.description ?? null,
					event_date: event.date,
					event_location: location.id ?? eventLocation?.id,
				})
				.returning('id')
				.execute();

			return eventCreated;
		});
	}
}

export default new EventsService();
