import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostsTable {
	id: Generated<string>;
	user_id: string;
	coordinates_id: string | null;
	category_id: string;
	caption: string;
	content: string;
	post_date: Generated<Date>;
	likes: Generated<number>;
}

export type Post = Selectable<PostsTable>;
export type NewPost = Insertable<PostsTable>;
export type UpdatedPost = Updateable<PostsTable>;
