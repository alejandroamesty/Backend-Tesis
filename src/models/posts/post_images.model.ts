import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostImagesTable {
	id: Generated<string>;
	post_id: string;
	image: string;
}

export type PostImage = Selectable<PostImagesTable>;
export type NewPostImage = Insertable<PostImagesTable>;
export type UpdatedPostImage = Updateable<PostImagesTable>;
