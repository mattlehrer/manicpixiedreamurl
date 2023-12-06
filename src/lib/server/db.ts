import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';

export const sqliteDatabase = sqlite('sqlite.db');
export const db: BetterSQLite3Database = drizzle(sqliteDatabase);
