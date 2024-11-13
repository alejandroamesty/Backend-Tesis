import { Insertable, Selectable, Updateable, Generated } from 'kysely';

export interface PostRepliesTable {
	id: Generated<number>;
	post_id: number;
	user_id: number;
	parent_reply_id: number | null;
	content: string;
	created_at: Generated<Date>;
}

export type PostReply = Selectable<PostRepliesTable>;
export type NewPostReply = Insertable<PostRepliesTable>;
export type UpdatedPostReply = Updateable<PostRepliesTable>;
