// src/db.js — Pure native SQLite using node:sqlite (zero external DB drivers or ORM middleware)
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'data', 'app.db');
mkdirSync(join(process.cwd(), 'data'), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_sub_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tracked_numbers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    digits TEXT NOT NULL,
    national TEXT NOT NULL,
    city TEXT,
    region TEXT,
    carrier TEXT,
    line_type TEXT,
    last_status TEXT,
    status_detail TEXT,
    aging_days INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_checked_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS board_categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS board_threads (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES board_categories(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    pinned INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS board_posts (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL REFERENCES board_threads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

// Seed default board categories if empty
const catCount = db.prepare('SELECT count(*) as count FROM board_categories').get().count;
if (catCount === 0) {
  const insertCat = db.prepare('INSERT INTO board_categories (id, slug, title, description, sort_order) VALUES (?, ?, ?, ?, ?)');
  insertCat.run('cat_recovery', 'number-recovery', 'Number Recovery & Reclamation', 'Strategies for tracking, recovering, or claiming lost and legacy phone numbers.', 1);
  insertCat.run('cat_pooling', 'pooling-and-aging', 'Pooling, Aging & Carrier Policies', 'Discussion on carrier recycling windows, thousands-block pools, and LERG data.', 2);
  insertCat.run('cat_general', 'general-discussion', 'General Telecom & Numbering', 'Questions, discoveries, and general discussion on North American phone numbers.', 3);
}

console.log('[DB] Native SQLite initialized at', DB_PATH);
