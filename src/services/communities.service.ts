import db from '../app/db.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';
import { RequireAtLeastOne } from '../types/types.ts';
type UpdateData = RequireAtLeastOne<
	{ name?: string; description?: string | null; image?: string | null }
>;

class CommunitiesService {
	async getAll(user_id: number) {
		return await db
			.selectFrom('communities')
			.leftJoin('chat_members', 'communities.chat_id', 'chat_members.chat_id')
			.where('chat_members.user_id', '=', user_id)
			.selectAll('communities')
			.execute();
	}

	async getById(id: number, user_id: number) {
		return await db
			.selectFrom('communities')
			.leftJoin('chat_members', 'communities.chat_id', 'chat_members.chat_id')
			.where('communities.id', '=', id)
			.where('chat_members.user_id', '=', user_id)
			.selectAll('communities')
			.execute();
	}

	async create(data: {
		user_id: number;
		members: number[];
		image: string | null;
		name: string;
		description: string | null;
		private_community: boolean;
	}) {
		return await db.transaction().execute(async (trx) => {
			// Insert the new chat
			const [chat] = await trx
				.insertInto('chats')
				.values({
					private_chat: false,
					description: data.description,
				})
				.returning('id')
				.execute();

			// Insert members for the chat

			const uniqueMembers = [
				...new Set(
					data.members.filter((member) => member !== data.user_id), // Exclude user_id and remove duplicates
				),
			];

			// Insert user_id and unique members into the chat
			await trx
				.insertInto('chat_members')
				.values([
					{ chat_id: chat.id, user_id: data.user_id }, // Include the creator
					...uniqueMembers.map((member) => ({ chat_id: chat.id, user_id: member })), // Include unique members
				])
				.execute();

			// Create the community
			await trx
				.insertInto('communities')
				.values({
					owner_id: data.user_id,
					chat_id: chat.id,
					image: data.image,
					name: data.name,
					description: data.description,
					private_community: data.private_community,
				})
				.execute();
		});
	}

	async delete(id: number, user_id: number) {
		return await db.transaction().execute(async (trx) => {
			// Check if the user is the owner of the community
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', id)
				.where('owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError('No tienes permisos para eliminar esta comunidad');
			}

			// Delete the community
			await trx.deleteFrom('communities').where('id', '=', id).execute();
		});
	}

	async update(id: number, user_id: number, data: UpdateData) {
		return await db.transaction().execute(async (trx) => {
			// Check if the user is the owner of the community
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', id)
				.where('owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError('No tienes permisos para editar esta comunidad');
			}

			// Update the community
			await trx
				.updateTable('communities')
				.set(data)
				.where('id', '=', id)
				.execute();
		});
	}
}

export default new CommunitiesService();
