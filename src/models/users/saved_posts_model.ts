import { Insertable, Selectable, Updateable } from 'kysely';

export interface SavedPostsTable {
	user_id: string;
	post_id: string;
}

export type SavedPost = Selectable<SavedPostsTable>;
export type NewSavedPost = Insertable<SavedPostsTable>;
export type UpdatedSavedPost = Updateable<SavedPostsTable>;
