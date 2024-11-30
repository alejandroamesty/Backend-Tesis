import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface CoordinatesTable {
	id: Generated<string>;
	x: number;
	y: number;
}

export type Coordinate = Selectable<CoordinatesTable>;
export type NewCoordinate = Insertable<CoordinatesTable>;
export type UpdatedCoordinate = Updateable<CoordinatesTable>;
