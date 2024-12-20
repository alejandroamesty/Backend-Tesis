import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface UserEmissionsTable {
	id: Generated<string>;
	user_id: string;
	impact: number;
	direct_emissions: number;
	indirect_emissions: number;
	other_emissions: number;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
}

export type UserEmission = Selectable<UserEmissionsTable>;
export type NewUserEmission = Insertable<UserEmissionsTable>;
export type UpdatedUserEmission = Updateable<UserEmissionsTable>;
