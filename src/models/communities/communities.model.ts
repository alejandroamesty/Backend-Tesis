import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface CommunitiesTable {
	id: Generated<string>;
	owner_id: string;
	chat_id: string;
	private_community: boolean;
	name: string;
	image: string | null;
	description: string | null;
}

export type Communities = Selectable<CommunitiesTable>;
export type NewCommunities = Insertable<CommunitiesTable>;
export type UpdatedCommunities = Updateable<CommunitiesTable>;
