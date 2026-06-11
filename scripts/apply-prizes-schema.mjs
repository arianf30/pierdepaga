#!/usr/bin/env node
/**
 * Aplica schema-prizes.sql vía Supabase Management API.
 * Requiere SUPABASE_ACCESS_TOKEN en .env.local
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const PROJECT_REF = 'uratileutrpwqxzwxejb'

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

async function runQuery(token, sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  )

  const body = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${body}`)
  }

  return body
}

async function main() {
  loadEnv()
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    console.error('Falta SUPABASE_ACCESS_TOKEN en .env.local')
    process.exit(1)
  }

  const sqlPath = resolve(root, 'supabase/schema-prizes.sql')
  const sql = readFileSync(sqlPath, 'utf8')

  console.log('Aplicando schema-prizes.sql en Supabase…')
  await runQuery(token, sql)
  console.log('Listo: premios por scope, user_id, moderación admin.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
