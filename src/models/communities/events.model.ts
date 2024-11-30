import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface EventsTable {
	id: Generated<string>;
	community_id: string;
	event_location: string;
	name: string;
	description: string | null;
	event_date: Date;
	cancelled: Generated<boolean>;
}

export type Events = Selectable<EventsTable>;
export type NewEvents = Insertable<EventsTable>;
export type UpdatedEvents = Updateable<EventsTable>;
