import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ChatMemberTable {
	id: Generated<number>;
	chat_id: number;
	user_id: number;
}

export type ChatMember = Selectable<ChatMemberTable>;
export type NewChatMember = Insertable<ChatMemberTable>;
export type UpdatedChatMember = Updateable<ChatMemberTable>;
