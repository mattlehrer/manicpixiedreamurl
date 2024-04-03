import { drizzle } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dirname } from 'node:path';
import { logger } from '$lib/server/logger';
import * as schema from '$lib/schema';
import { fileURLToPath } from 'node:url';

export const sqliteDatabase = new sqlite(dirname(fileURLToPath(import.meta.url)) + '/../../../sqlite.db');

// https://kerkour.com/sqlite-for-servers
try {
	sqliteDatabase.pragma('journal_mode = WAL');
} catch (error) {
	logger.error('Sqlite error: Failed to set WAL mode', error);
}
try {
	sqliteDatabase.pragma('busy_timeout = 5000');
} catch (error) {
	logger.error('Sqlite error: Failed to set busy_timeout', error);
}
try {
	sqliteDatabase.pragma('synchronous = NORMAL');
} catch (error) {
	logger.error('Sqlite error: Failed to set synchronous', error);
}
try {
	sqliteDatabase.pragma('cache_size = 1000000000');
} catch (error) {
	logger.error('Sqlite error: Failed to set cache_size', error);
}
try {
	sqliteDatabase.pragma('foreign_keys = true');
} catch (error) {
	logger.error('Sqlite error: Failed to set foreign_keys', error);
}
try {
	sqliteDatabase.pragma('temp_store = memory');
} catch (error) {
	logger.error('Sqlite error: Failed to set temp_store', error);
}

export const db = drizzle(sqliteDatabase, { schema });
