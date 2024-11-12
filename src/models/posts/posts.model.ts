import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PostsTable {
	id: Generated<number>;
	user_id: number;
	coordinates_id: number | null;
	category_id: number;
	caption: string;
	content: string;
	post_date: Generated<Date>;
	likes: Generated<number>;
}

export type Post = Selectable<PostsTable>;
export type NewPost = Insertable<PostsTable>;
export type UpdatedPost = Updateable<PostsTable>;
