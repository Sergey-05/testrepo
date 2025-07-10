'use server';

import { Pool } from 'pg';

// Настройка пула подключений к PostgreSQL
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'your_database_name',
  password: process.env.PGPASSWORD || 'your_password',
  port: parseInt(process.env.PGPORT || '5432', 10),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false, // Игнорировать проверку сертификата (для самоподписанных сертификатов)
  },
});

// Обработка ошибок пула
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

// Проверка подключения при старте
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Универсальная функция query для выполнения SQL-запросов
export async function query<T extends object>(
  text: string,
  params: unknown[] = []
): Promise<{ rows: T[] }> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows };
  } catch (error: unknown) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error}`);
  } finally {
    client.release();
  }
}