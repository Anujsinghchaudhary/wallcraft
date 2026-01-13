import { Metadata } from 'next'
import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your WallCraft account',
}

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
        <p className="text-muted-foreground">
          Join WallCraft to access premium wallpapers
        </p>
      </div>

      <SignupForm redirectUrl={params.redirect} />
    </div>
  )
}
