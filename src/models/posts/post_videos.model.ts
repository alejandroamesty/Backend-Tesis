import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostVideosTable {
	id: Generated<string>;
	post_id: string;
	video: string;
}

export type PostImage = Selectable<PostVideosTable>;
export type NewPostImage = Insertable<PostVideosTable>;
export type UpdatedPostImage = Updateable<PostVideosTable>;
