import db from '../app/db.ts';
import { ForbiddenError } from '../utils/errors/httpErrors.ts';
import { RequireAtLeastOne } from '../types/types.ts';
import { sql } from 'kysely';
type UpdateData = RequireAtLeastOne<
	{
		name?: string;
		description?: string | null;
		image?: string | null;
		private_community?: boolean;
	}
>;

class CommunitiesService {
	async getAll(user_id: number) {
		return await db
			.selectFrom('communities')
			.leftJoin('chat_members as cm', 'communities.chat_id', 'cm.chat_id')
			.leftJoin('users as u', 'cm.user_id', 'u.id')
			.where(
				'communities.chat_id',
				'in',
				db.selectFrom('chat_members')
					.select('chat_id')
					.where('user_id', '=', user_id),
			)
			.select([
				'communities.id',
				'communities.name',
				'communities.description',
				'communities.image',
				'communities.private_community',
				sql`
					json_agg(
						json_build_object(
							'user_id', u.id,
							'username', u.username,
							'image', u.image,
							'fname', u.fname,
							'lname', u.lname
						)
					) FILTER (WHERE u.id IS NOT NULL)
				`.as('members'),
			])
			.groupBy('communities.id')
			.execute();
	}

	async getById(id: number, user_id: number) {
		const result = await db
			.selectFrom('communities')
			.leftJoin('chat_members as cm', 'communities.chat_id', 'cm.chat_id')
			.leftJoin('users as u', 'cm.user_id', 'u.id')
			.where('communities.id', '=', id)
			.where(
				'communities.chat_id',
				'in',
				db.selectFrom('chat_members')
					.select('chat_id')
					.where('user_id', '=', user_id),
			)
			.select([
				'communities.id',
				'communities.name',
				'communities.description',
				'communities.image',
				'communities.private_community',
				sql`
					json_agg(
						json_build_object(
							'user_id', u.id,
							'username', u.username,
							'image', u.image,
							'fname', u.fname,
							'lname', u.lname
						)
					) FILTER (WHERE u.id IS NOT NULL)
				`.as('members'),
			])
			.groupBy('communities.id')
			.execute();

		return result[0];
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

	async addMember(community_id: number, user_id: number, new_member_id: number) {
		return await db.transaction().execute(async (trx) => {
			// Check if the user is the owner of the community
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', community_id)
				.where('owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError(
					'No tienes permisos para añadir miembros a esta comunidad',
				);
			}

			// Add the member to the community
			await trx
				.insertInto('chat_members')
				.values({ chat_id: community.chat_id, user_id: new_member_id })
				.execute();
		});
	}

	async removeMember(community_id: number, user_id: number, new_member_id: number) {
		return await db.transaction().execute(async (trx) => {
			// Check if the user is the owner of the community
			const [community] = await trx
				.selectFrom('communities')
				.where('id', '=', community_id)
				.where('owner_id', '=', user_id)
				.selectAll()
				.execute();

			if (!community) {
				throw new ForbiddenError(
					'No tienes permisos para eliminar miembros de esta comunidad',
				);
			}

			// Remove the member from the community
			await trx
				.deleteFrom('chat_members')
				.where('chat_id', '=', community.chat_id)
				.where('user_id', '=', new_member_id)
				.execute();
		});
	}
}

export default new CommunitiesService();
