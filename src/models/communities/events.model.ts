import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface EventsTable {
	id: Generated<number>;
	community_id: number;
	event_location: number;
	name: string;
	description: string;
	event_date: Date;
}

export type Events = Selectable<EventsTable>;
export type NewEvents = Insertable<EventsTable>;
export type UpdatedEvents = Updateable<EventsTable>;
