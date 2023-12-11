import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';

export const sqliteDatabase = new sqlite('./sqlite.db');
export const db: BetterSQLite3Database = drizzle(sqliteDatabase);

console.log('running migrations');
try {
	migrate(db, { migrationsFolder: './drizzle/migrations' });
} catch (error) {
	console.error(error);
}
