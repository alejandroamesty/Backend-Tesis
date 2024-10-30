import { UserTable } from './user.model.ts';

export interface Database {
	users: UserTable;
}
