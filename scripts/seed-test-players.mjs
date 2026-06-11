#!/usr/bin/env node
/**
 * Crea 10 jugadores de prueba en Supabase Auth + profiles.
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 *
 * Credenciales:
 *   user1@pierdepaga.test … user10@pierdepaga.test
 *   contraseña: 123456
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const TEST_PLAYERS = [
  { n: 1, label: 'User1', first: 'User1', last: 'Prueba' },
  { n: 2, label: 'User2', first: 'User2', last: 'Prueba' },
  { n: 3, label: 'User3', first: 'User3', last: 'Prueba' },
  { n: 4, label: 'User4', first: 'User4', last: 'Prueba' },
  { n: 5, label: 'User5', first: 'User5', last: 'Prueba' },
  { n: 6, label: 'User6', first: 'User6', last: 'Prueba' },
  { n: 7, label: 'User7', first: 'User7', last: 'Prueba' },
  { n: 8, label: 'User8', first: 'User8', last: 'Prueba' },
  { n: 9, label: 'User9', first: 'User9', last: 'Prueba' },
  { n: 10, label: 'User10', first: 'User10', last: 'Prueba' },
]

const PASSWORD = '123456'
const EMAIL_DOMAIN = 'pierdepaga.test'
const PROVINCE = 'Prueba'

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

async function findUserByEmail(admin, email) {
  let page = 1
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    })
    if (error) throw error
    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    )
    if (found) return found
    if (data.users.length < 200) break
    page += 1
  }
  return null
}

async function main() {
  loadEnv()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('Creando jugadores de prueba…\n')

  for (const player of TEST_PLAYERS) {
    const email = `user${player.n}@${EMAIL_DOMAIN}`

    let userId = null
    const existing = await findUserByEmail(admin, email)

    if (existing) {
      userId = existing.id
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: player.label,
          display_name: player.label,
        },
      })
      if (error) throw error
      console.log(`↻ Actualizado auth: ${email}`)
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: player.label,
          display_name: player.label,
        },
      })
      if (error) throw error
      userId = data.user.id
      console.log(`✓ Creado auth: ${email}`)
    }

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        account_type: 'jugador',
        first_name: player.first,
        last_name: player.last,
        display_name: player.label,
        country_id: 'ar',
        province: PROVINCE,
      },
      { onConflict: 'id' },
    )

    if (profileError) throw profileError
    console.log(`  Perfil: ${player.label} · provincia ${PROVINCE}`)
  }

  console.log('\nListo. Credenciales de prueba:')
  console.log(`  Email: user1@${EMAIL_DOMAIN} … user10@${EMAIL_DOMAIN}`)
  console.log(`  Clave: ${PASSWORD}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
