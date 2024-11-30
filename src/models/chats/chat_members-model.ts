import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ChatMemberTable {
	id: Generated<string>;
	chat_id: string;
	user_id: string;
}

export type ChatMember = Selectable<ChatMemberTable>;
export type NewChatMember = Insertable<ChatMemberTable>;
export type UpdatedChatMember = Updateable<ChatMemberTable>;
