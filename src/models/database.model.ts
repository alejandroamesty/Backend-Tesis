import { UserTable } from './users/user.model.ts';

import { PostsTable } from './posts/posts.model.ts';
import { PostCategoryTable } from './posts/post_category.model.ts';
import { PostImagesTable } from './posts/post_images.model.ts';
import { PostVideosTable } from './posts/post_videos.model.ts';
import { PostLikesTable } from './posts/post_likes.model.ts';
import { PostRepliesTable } from './posts/post_replies.model.ts';

import { CoordinatesTable } from './coordinates.model.ts';
import { UserFollowerTable } from './users/user_follower.model.ts';
import { SavedPostsTable } from './users/saved_posts_model.ts';
import { ChatTable } from './chats/chats.model.ts';
import { ChatMemberTable } from './chats/chat_members-model.ts';
import { ChatMessageTable } from './chats/chat_messages.model.ts';

import { CommunitiesTable } from './communities/communities.model.ts';
import { EventsTable } from './communities/events.model.ts';

export interface Database {
	//users
	users: UserTable;
	user_followers: UserFollowerTable;
	saved_posts: SavedPostsTable;

	coordinates: CoordinatesTable;

	//posts
	posts: PostsTable;
	post_categories: PostCategoryTable;
	post_images: PostImagesTable;
	post_videos: PostVideosTable;
	post_likes: PostLikesTable;
	post_replies: PostRepliesTable;

	//chats
	chats: ChatTable;
	chat_members: ChatMemberTable;
	chat_messages: ChatMessageTable;

	//communities
	communities: CommunitiesTable;
	events: EventsTable;
}
