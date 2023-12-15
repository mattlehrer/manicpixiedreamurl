import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dev } from '$app/environment';

console.log('Running migrations...');
const sqlitePath = new URL(dev ? '' : '../../..' + './sqlite.db', import.meta.url).pathname;
console.log({ sqlitePath });
const sqliteDatabase = new sqlite(sqlitePath);
const db: BetterSQLite3Database = drizzle(sqliteDatabase);

try {
	const migrationsPath = new URL(dev ? '' : '../../..' + './drizzle/migrations', import.meta.url).pathname;
	migrate(db, { migrationsFolder: migrationsPath });
} catch (error) {
	console.error(error);
	if (error instanceof Error) console.error(error.name, error.message);
}
