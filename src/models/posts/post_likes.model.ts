import { Insertable, Selectable, Updateable } from 'kysely';

export interface PostLikesTable {
	post_id: string;
	user_id: string;
}

export type PostLike = Selectable<PostLikesTable>;
export type NewPostLike = Insertable<PostLikesTable>;
export type UpdatedPostLike = Updateable<PostLikesTable>;
