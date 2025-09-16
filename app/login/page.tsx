// app/login/page.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          const userId = session?.user?.id
          if (!userId) return

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

          if (error || !profile) {
            router.push('/')
            return
          }

          switch (profile.role) {
            case 'student':
              router.push('/student')
              break
            case 'teacher':
              router.push('/teacher')
              break
            case 'head_teacher':
              router.push('/head-teacher')
              break
            default:
              router.push('/')
              break
          }
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Welcome Back 👋
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb', // Tailwind blue-600
                  brandAccent: '#1e40af', // Tailwind blue-800
                  brandButtonText: 'white',
                },
              },
            },
          }}
          theme="default"
          providers={['google', 'github']}
        />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Terms
          </a>{' '}
          &{' '}
          <a href="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
