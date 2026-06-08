import { LoginScreen } from '@/components/auth/login-screen'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const errorMessage =
    params.error === 'auth'
      ? (params.message ?? 'No se pudo completar el inicio de sesión.')
      : null

  return <LoginScreen errorMessage={errorMessage} />
}
