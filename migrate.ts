import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dev } from '$app/environment';

console.log('Running migrations...');
const workingDirArray = new URL(dev ? '' : '../../../', import.meta.url).pathname.split('/');
workingDirArray.pop();
const workingDir = workingDirArray.join('/');
const sqlitePath = workingDir + '/sqlite.db';
console.log({ sqlitePath });
const sqliteDatabase = new sqlite(sqlitePath);
const db: BetterSQLite3Database = drizzle(sqliteDatabase);

try {
	const migrationsPath = workingDir + '/drizzle/migrations';
	console.log({ migrationsPath });
	migrate(db, { migrationsFolder: migrationsPath });
} catch (error) {
	console.error(error);
	if (error instanceof Error) console.error(error.name, error.message);
}
