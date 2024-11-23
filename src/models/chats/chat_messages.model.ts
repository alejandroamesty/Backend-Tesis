import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ChatMessageTable {
	id: Generated<number>;
	chat_id: number;
	user_id: number;
	content_type: 1 | 2 | 3;
	content: string;
	created_at: Generated<Date>;
}

export type ChatMessage = Selectable<ChatMessageTable>;
export type NewChatMessage = Insertable<ChatMessageTable>;
export type UpdatedChatMessage = Updateable<ChatMessageTable>;
