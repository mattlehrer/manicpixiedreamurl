import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const sqliteDatabase = new sqlite(dirname(fileURLToPath(import.meta.url)) + '/../../../sqlite.db');
export const db: BetterSQLite3Database = drizzle(sqliteDatabase);
