import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';

export const sqliteDatabase = new sqlite('sqlite.db', {
	verbose: console.log,
	fileMustExist: false,
});
export const db: BetterSQLite3Database = drizzle(sqliteDatabase);
