import { Client } from 'https://deno.land/x/postgres/mod.ts';

const host = Deno.env.get('DB_HOST');
const port = Deno.env.get('DB_PORT');
const user = Deno.env.get('DB_USER');
const password = Deno.env.get('DB_PASSWORD');
const database = Deno.env.get('DB_NAME');

if (!host || !port || !user || !password || !database) {
	throw new Error('Missing environment variables for database connection');
}

const DATABASE_URL = `postgres://${user}:${password}@${host}:${port}/${database}`;

const sqlFilePaths = [
	'./src/migrations/db.sql',
	'./src/migrations/seeders/seeder.sql',
]; // Paths to your SQLs file

async function dropAllTables(client: Client) {
	console.log('Dropping all tables...');

	// Get the list of all tables
	const result = await client.queryObject<{ table_name: string }>(
		`SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`,
	);

	const tables = result.rows.map((row) => row.table_name);

	// Drop each table
	for (const table of tables) {
		console.log(`Dropping table: ${table}`);
		await client.queryArray(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
	}

	console.log('All tables dropped successfully.');
}

async function dropAllSequences(client: Client) {
	console.log('Dropping all sequences...');

	// Get the list of all sequences
	const result = await client.queryObject<{ sequence_name: string }>(
		`SELECT sequence_name FROM information_schema.sequences 
    WHERE sequence_schema = 'public';`,
	);

	const sequences = result.rows.map((row) => row.sequence_name);

	// Drop each sequence
	for (const sequence of sequences) {
		console.log(`Dropping sequence: ${sequence}`);
		await client.queryArray(`DROP SEQUENCE IF EXISTS "${sequence}" CASCADE;`);
	}

	console.log('All sequences dropped successfully.');
}

async function executeSQLFile(client: Client, filePath: string) {
	console.log(`Executing SQL file: ${filePath}`);

	// Read the SQL file
	const sql = await Deno.readTextFile(filePath);

	// Execute the entire SQL file at once (for procedural blocks)
	try {
		await client.queryArray(sql);
		console.log(`SQL file executed successfully: ${filePath}`);
	} catch (error) {
		console.error(`Error executing SQL file: ${filePath}`);
		throw error; // Rethrow to halt execution
	}
}

async function main() {
	const client = new Client(DATABASE_URL);

	try {
		await client.connect();

		// Drop all tables
		await dropAllTables(client);

		// Drop all sequences
		await dropAllSequences(client);

		// Execute all SQL files
		for (const filePath of sqlFilePaths) {
			await executeSQLFile(client, filePath);
		}
	} catch (err) {
		console.error('Error during migration:', err);
	} finally {
		await client.end();
	}
}

main();
