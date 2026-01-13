import { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your WallCraft account',
}

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to access your purchased wallpapers
        </p>
      </div>

      <LoginForm redirectUrl={params.redirect} />
    </div>
  )
}
