import { UserTable } from './user.model.ts';

import { PostsTable } from './posts/posts.model.ts';
import { PostCategoryTable } from './posts/post_category.model.ts';
import { PostImagesTable } from './posts/post_images.model.ts';
import { PostVideosTable } from './posts/post_videos.model.ts';
import { PostLikesTable } from './posts/post_likes.model.ts';
import { PostRepliesTable } from './posts/post_replies.model.ts';

import { CoordinatesTable } from './coordinates.model.ts';

export interface Database {
	users: UserTable;
	coordinates: CoordinatesTable;
	posts: PostsTable;
	post_categories: PostCategoryTable;
	post_images: PostImagesTable;
	post_videos: PostVideosTable;
	post_likes: PostLikesTable;
	post_replies: PostRepliesTable;
}
