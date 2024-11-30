import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostRepliesTable {
	id: Generated<string>;
	post_id: string;
	user_id: string;
	parent_reply_id: string | null;
	content: string;
	created_at: Generated<Date>;
}

export type PostReply = Selectable<PostRepliesTable>;
export type NewPostReply = Insertable<PostRepliesTable>;
export type UpdatedPostReply = Updateable<PostRepliesTable>;
