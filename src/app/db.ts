import { Kysely, PostgresDialect } from 'kysely';
import Pool from 'pg-pool';
import type { Database } from '../models/database.model.ts';

const client = new Pool({
	user: Deno.env.get('DB_USER') || 'postgres',
	host: Deno.env.get('DB_HOST') || 'localhost',
	database: Deno.env.get('DB_NAME') || 'postgres',
	password: Deno.env.get('DB_PASSWORD') || 'password',
	port: Number(Deno.env.get('DB_PORT') || '5432'),
});

const db = new Kysely<Database>({
	dialect: new PostgresDialect({ pool: client }),
});

export default db;
