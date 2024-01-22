import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dev } from '$app/environment';
import { logger } from '$lib/server/logger';

logger.info('Running migrations...');
const workingDirArray = new URL(dev ? '' : '../../../', import.meta.url).pathname.split('/');
workingDirArray.pop();
const workingDir = workingDirArray.join('/');
const sqlitePath = workingDir + '/sqlite.db';
logger.debug({ sqlitePath });
const sqliteDatabase = new sqlite(sqlitePath);
const db: BetterSQLite3Database = drizzle(sqliteDatabase);

try {
	const migrationsPath = workingDir + '/drizzle/migrations';
	logger.debug({ migrationsPath });
	migrate(db, { migrationsFolder: migrationsPath });
	sqliteDatabase.close();
} catch (error) {
	logger.error(error);
	if (error instanceof Error) logger.error(error.name, error.message);
}
