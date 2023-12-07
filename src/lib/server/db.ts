import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const sqliteDatabase = new sqlite(dirname(fileURLToPath(import.meta.url)) + '/../../../sqlite.db', {
	verbose: console.log,
	fileMustExist: false,
});
export const db: BetterSQLite3Database = drizzle(sqliteDatabase);
