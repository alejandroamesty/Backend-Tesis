import { Insertable, Selectable, Updateable } from 'kysely';

export interface UserFollowerTable {
	user_id: number;
	user_follower: number;
}

export type userFollower = Selectable<UserFollowerTable>;
export type NewUserFollower = Insertable<UserFollowerTable>;
export type UpdatedUserFollower = Updateable<UserFollowerTable>;
