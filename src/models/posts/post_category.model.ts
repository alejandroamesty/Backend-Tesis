import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostCategoryTable {
	id: Generated<string>;
	name: string;
}

export type PostCategory = Selectable<PostCategoryTable>;
export type NewPostCategory = Insertable<PostCategoryTable>;
export type UpdatedPostCategory = Updateable<PostCategoryTable>;
