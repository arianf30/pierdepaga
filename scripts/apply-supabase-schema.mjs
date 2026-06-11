#!/usr/bin/env node
/**
 * Aplica el esquema inicial en Supabase (proyecto remoto).
 * Requiere SUPABASE_DB_PASSWORD en .env.local
 * (Dashboard → Project Settings → Database → Database password)
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(root, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx)
    const value = trimmed.slice(idx + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const password = process.env.SUPABASE_DB_PASSWORD
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!password || !url) return null

  const ref = url.replace('https://', '').replace('.supabase.co', '')
  const host = process.env.SUPABASE_DB_HOST || 'aws-0-sa-east-1.pooler.supabase.com'
  const port = process.env.SUPABASE_DB_PORT || '5432'
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:${port}/postgres`
}

async function main() {
  loadEnv()

  const conn = connectionString()
  if (!conn) {
    console.error(
      'Falta SUPABASE_DB_PASSWORD (o DATABASE_URL) en .env.local\n' +
        'Obtenela en: Supabase Dashboard → Settings → Database → Database password',
    )
    process.exit(1)
  }

  const sqlPath = resolve(root, 'supabase/schema.sql')
  const sql = readFileSync(sqlPath, 'utf8')

  const client = new pg.Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  })

  console.log('Conectando a Supabase Postgres…')
  await client.connect()
  console.log('Aplicando esquema…')
  await client.query(sql)

  const gamePath = resolve(root, 'supabase/schema-game.sql')
  if (existsSync(gamePath)) {
    const gameSql = readFileSync(gamePath, 'utf8')
    console.log('Aplicando esquema de juego…')
    await client.query(gameSql)
  }

  await client.end()
  console.log(
    'Listo: profiles, sponsor_prize_submissions, dominio de juego (scopes, partidos, ranking).',
  )
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
