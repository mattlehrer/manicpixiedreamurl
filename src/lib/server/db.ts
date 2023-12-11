import { drizzle } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { dirname } from 'node:path';
import * as schema from '$lib/schema';
import { fileURLToPath } from 'node:url';

export const sqliteDatabase = new sqlite(dirname(fileURLToPath(import.meta.url)) + '/../../../sqlite.db');
export const db = drizzle(sqliteDatabase, { schema });
