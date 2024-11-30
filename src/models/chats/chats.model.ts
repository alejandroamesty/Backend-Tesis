import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ChatTable {
	id: Generated<string>;
	private_chat: boolean;
	description: string | null;
	created_at: Generated<Date>;
}

export type Chat = Selectable<ChatTable>;
export type NewChat = Insertable<ChatTable>;
export type UpdatedChat = Updateable<ChatTable>;
