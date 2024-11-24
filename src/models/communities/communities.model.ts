import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface CommunitiesTable {
	id: Generated<number>;
	owner_id: number;
	chat_id: number;
	private_community: boolean;
	name: string;
	image: string | null;
	description: string | null;
}

export type Communities = Selectable<CommunitiesTable>;
export type NewCommunities = Insertable<CommunitiesTable>;
export type UpdatedCommunities = Updateable<CommunitiesTable>;
