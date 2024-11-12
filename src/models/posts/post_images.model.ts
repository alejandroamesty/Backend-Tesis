import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostImagesTable {
	id: Generated<number>;
	post_id: number;
	image: string;
}

export type PostImage = Selectable<PostImagesTable>;
export type NewPostImage = Insertable<PostImagesTable>;
export type UpdatedPostImage = Updateable<PostImagesTable>;
