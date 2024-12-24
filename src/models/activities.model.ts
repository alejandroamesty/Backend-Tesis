import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ActivitiesTable {
	id: Generated<string>;
	user_id: string;
	activity_description: string;
	completed: Generated<boolean>;
	registered_at: Generated<Date>;
	completed_at: Generated<Date | null>;
}

export type Activity = Selectable<ActivitiesTable>;
export type NewActivity = Insertable<ActivitiesTable>;
export type UpdatedActivity = Updateable<ActivitiesTable>;
